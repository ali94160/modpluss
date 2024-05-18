import { User } from "../models/User.js";
import { SystemMessage, SystemGiveaway } from "../models/system.js";
import { addSkin, sendSkinToUser } from "./skinController.js";

let intervalId = null;
export const createSystemMessage = async (req, res) => {
    try {
        // Who am I?
        const message = await SystemMessage.create(req.body)
        res.status(200).json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const getSystemMessage = async (req, res) => {
    try {
        const message = await SystemMessage.findOne();
        res.status(200).json(message);
    } catch (error) {
        res.status(404);
    }
}

export const removeSystemMessage = async (req, res) => {
    try {
        await SystemMessage.findOneAndDelete(req.body._id);
        res.status(200).json({ message: "System message removed"});
    } catch (error) {
        res.stats(400).json({error: error.message})
    }
}

export const createGiveaway = async (req, res) => { 
    try {
        if(!req.session.user) return res.status(400).json({ error: "Not logged in" });
        const giveaway = await SystemGiveaway.create(req.body);
        await res.status(200).json(giveaway);
        startChecking();
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const checkAndPickWinner = async (req, res) => {
  try {
    let giveaway = await SystemGiveaway.findOne({})
      .sort({ _id: -1 }) // Sort by _id to get the latest entry
      .exec();

    if(giveaway && giveaway.hasWinner){
      let winnerUsr = await User.findById({ _id: giveaway.winner }).exec();
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('Periodic check stopped');
      }
      return res.json({ timeLeft: null, giveaway: giveaway, winUser: winnerUsr.username });
    } else {
      
      let now = new Date();
      if (giveaway && !giveaway.hasWinner && now >= giveaway.endDate && giveaway.entries.length > 0) {
        const randomIndex = Math.floor(Math.random() * giveaway.entries.length);
        const winnerId = giveaway.entries[randomIndex];
        giveaway.winner = winnerId;
        giveaway.hasWinner = true;
        await giveaway.save();
        let winnerUser = await User.findById({ _id: winnerId });
        
        console.log(`Winner selected for giveaway ${giveaway._id}: User ${winnerUser.username}`);
        const sendSkinObj = {reqUserId: winnerId, reqSkin: giveaway.skin, reqGiveawayId: giveaway._id}
        console.log(sendSkinObj, ' SendSkinObj?')
        await sendSkinToUser(sendSkinObj);
        return res.json({ timeLeft: null, giveaway: giveaway, winUser: winnerUser.username });
      } else {
        if(!giveaway)
          return;
        // Calculate time left until the end of the giveaway
        const currentDate = new Date();
        const endDate = giveaway.endDate;
        const timeLeft = endDate.getTime() - currentDate.getTime();
        const secondsLeft = Math.floor(timeLeft / 1000);
        const minutesLeft = Math.floor(secondsLeft / 60);
        const hoursLeft = Math.floor(minutesLeft / 60);
        const daysLeft = Math.floor(hoursLeft / 24);
        
        // Construct object with time left data
        let timeLeftObject = {
          daysLeft: daysLeft,
          hoursLeft: hoursLeft % 24,
          minutesLeft: minutesLeft % 60,
          secondsLeft: secondsLeft % 60
        };
        return res.json({timeLeft: timeLeftObject, giveaway: giveaway, winUser: null })
      }
    }
  } catch (error) {
    console.error('Error in checkAndPickWinner:', error);
    if (res && res.status) {
      return res.status(500).json({ message: "Internal server error" });
    } else {
      console.error('Response object is undefined:', res);
    }
  }
};

  const startChecking = () => {
    if (!intervalId) {
      intervalId = setInterval(async () => {
        const hasPendingGiveaway = await SystemGiveaway.exists({ hasWinner: false });
        if (hasPendingGiveaway) {
            console.log("Checking for winner...");
          await checkAndPickWinner();
        }
      }, 10000);
      console.log('Periodic check started');
    } else {
      console.log('Periodic check is already running');
    }
  };

  export const stopGiveawayAndPickWinner = async () => {
    try {
      const giveaway = await SystemGiveaway.findOne({ hasWinner: false });
      if (!giveaway) {
        console.log('No pending giveaways to stop');
        return;
      }
  
      if (giveaway.entries.length > 0) {
        const randomIndex = Math.floor(Math.random() * giveaway.entries.length);
        const winnerId = giveaway.entries[randomIndex];
        giveaway.winner = winnerId;
        giveaway.hasWinner = true;
        await giveaway.save();
        const winnerUser = await User.findById(winnerId).exec();
        console.log(`Winner selected for giveaway ${giveaway._id}: User ${winnerUser.username}`);
      } else {
        console.log('No entries in the giveaway to pick a winner from');
      }
  
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('Periodic check stopped');
      }
    } catch (error) {
      console.error('Error stopping giveaway and picking winner:', error.message);
    }
  };

  export const enterGiveaway = async (req, res) => {
    try {
      if(!req.body.id || !req.session.user) return res.stats(404);
      let ga = await SystemGiveaway.findOne({_id: req.body.id}).exec();
      const alreadyEntered = ga.entries.find(f => f._id == req.session.user._id);
      console.log(alreadyEntered, ga.entries , ' ENTERED entries, already?')
      if(alreadyEntered) return res.status(200).json({ message: "Already entered"});

      let giveaway = await SystemGiveaway.findOneAndUpdate({_id: req.body.id},
        { $push: { entries: req.session.user._id } },
        { new: true },
      );
      giveaway.save();
      res.status(200).json({ message: "Entered"});
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
