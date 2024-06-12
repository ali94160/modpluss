import { User } from "../models/User.js";
import { SystemMessage, SystemGiveaway, SystemLog } from "../models/System.js";


// Date formatter:
export function newDate() {
  const date = new Date();
  // Options to format only the date
  const dateOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  // Options to format the time
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  const formattedDateParts = date.toLocaleDateString(undefined, dateOptions).split(/\D/);
  let year, month, day;
  
  if (formattedDateParts[0].length === 4) {
    [year, month, day] = formattedDateParts;
  } else {
    [day, month, year] = formattedDateParts;
  }
  const formattedDateString = `${year}/${month}/${day}`;
  // Format the time using the user's local settings
  const formattedTimeString = date.toLocaleTimeString(undefined, timeOptions);
  return `${formattedDateString} ${formattedTimeString}`;
}

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
        await SystemLog.create({ 
          type: 0, 
          text:  `${req.session.user.username} created a giveaway: ${giveaway.skin.title} ${giveaway.skin.title === "Mod Case" ? "x" + giveaway.skin.price : giveaway.skin.title === "Mod Coins" ? "x" +giveaway.skin.price : ""}`, 
          date: newDate()})
        startChecking();
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const checkAndPickWinner = async (req, res) => {
  try {
    let giveaway = await SystemGiveaway.findOne({})
    .sort({ _id: -1 }) // Sort by _id to get the latest entry
    .hint({ $natural: -1 }) // Force MongoDB to ignore cache and perform a fresh query
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
        giveaway.isDone = true;
        let winnerUser = await User.findById({ _id: winnerId }).exec();
        await giveaway.save({ new: true })
        return res.json({ timeLeft: null, giveaway: giveaway, winUser: winnerUser.username });
      } else {
        if(!giveaway){
          return
        }
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
    if (res && res.status) {
      return res.status(500).json({ message: "Internal server error" });
    } else {
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
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
          console.log('Periodic check stopped');
        }
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
      if (!req.body.id || !req.session.user) {
        return res.status(404).json({ message: "Not found" });
      }
  
      // Find the latest giveaway
      let ga = await SystemGiveaway.findOne().sort({ _id: -1 });
      if (!ga) {
        return res.status(404).json({ message: "Giveaway not found" });
      }
      // Check if the user has already entered
      const alreadyEntered = ga.entries.some(entry => entry.toString() === req.session.user._id.toString());
      if (alreadyEntered) {
        return res.status(200).json({ message: "Already entered" });
      } else {
        // Add user to the giveaway entries
        let giveaway = await SystemGiveaway.findOneAndUpdate(
          { _id: req.body.id },
          { $push: { entries: req.session.user._id } },
          { new: true }
        );
        await SystemLog.create({ type: 0, text: `${req.session.user.username} has joined the giveaway: ${giveaway._id}`, date: newDate()})
        res.status(200).json({ message: "Entered" });
      }
    } catch (error) {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('Periodic check stopped');
      }
      console.error("Error: ", error);
      res.status(400).json({ error: error.message });
    }
  };
  

  export const getLastGiveaway = async (req, res) => {
    const lastGiveaway = await SystemGiveaway.findOne().sort({ _id: -1 }).populate('winner');
    let latest = await lastGiveaway.save({ new: true })
    console.log("_________ LATEST ______", latest, " + ", lastGiveaway)
    res.status(200).json(latest);
  }

  export const removeGiveaway = async (req, res) => {
    try {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('Periodic check stopped');
      }
      await SystemGiveaway.deleteMany({});
      await SystemLog.create({ type: 0, text: `${req.session.user.username} has removed the giveaways`, date: newDate()})
      res.status(200).json({ message: "Giveaway removed" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  export const getSystemLogs = async (req, res) => {
    try {
      const systemLogs = await SystemLog.find({});
      res.status(200).json(systemLogs);
    } catch (error) {
      res.status(500);
    }
  }

  export const clearSystemLogs = async (req, res) => {
    try {
      await SystemLog.deleteMany({});
      res.status(200).json({ message: "System logs cleared" });
    } catch (error) {
      res.status(500);
    }
  }

  export const addLogging = async (req, res) => { 
    try {
      console.log(" WATTT ", req.body)
        await SystemLog.create(req.body);
        await res.status(200);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}