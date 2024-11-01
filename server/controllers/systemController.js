import { User } from "../models/User.js";
import { SystemMessage, SystemGiveaway, SystemLog, SystemAdminCall, SystemCasino, SystemStats } from "../models/System.js";
import { Skin } from "../models/Skin.js";

export function newDate() {
  const date = new Date();

  // Offset in minutes for Central European Time (CET/CEST)
  const offsetMinutes = date.getTimezoneOffset() + 120; // CET is UTC+1, but +60 more during daylight saving (CEST)
  date.setMinutes(date.getMinutes() + offsetMinutes); // Adjust time to CET/CEST
  
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
    // Find the latest giveaway entry
    let giveaway = await SystemGiveaway.findOne({})
      .sort({ _id: -1 }) // Sort by _id to get the latest entry
      .exec();
      //.hint({ $natural: -1 }) // Force MongoDB to ignore cache and perform a fresh query

    if (giveaway && giveaway.hasWinner) {
      let winnerUsr = await User.findById({ _id: giveaway.winner }).exec();
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('Periodic check stopped');
      }
      return res.json({ timeLeft: null, giveaway: giveaway, winUser: winnerUsr.username });
    } else {
      let now = new Date();
      if (giveaway && !giveaway.isDone && !giveaway.hasWinner && now >= giveaway.endDate && giveaway.entries.length > 0) {
        const randomIndex = Math.floor(Math.random() * giveaway.entries.length);
        const winnerId = giveaway.entries[randomIndex];

        // Update the giveaway document atomically
        const updatedGiveaway = await SystemGiveaway.findOneAndUpdate(
          { _id: giveaway._id, hasWinner: false }, // Ensure we only update if hasWinner is false
          {
            $set: {
              winner: winnerId,
              hasWinner: true,
              isDone: true,
            },
          },
          { new: true } // Return the updated document
        ).exec();

        if (!updatedGiveaway) {
          // Another instance already processed this giveaway
          return res.status(409).json({ message: "Giveaway already processed" });
        }

        let winnerUser = await User.findById({ _id: winnerId }).exec();
        if (!winnerUser) return res.status(404).json({ error: "User not found" });

        // Check if the prize has already been awarded
        if (updatedGiveaway.beenPaid) {
          console.log("____  BEEN PAID  ___");
          return res.json({ timeLeft: null, giveaway: updatedGiveaway, winUser: winnerUser.username });
        }

        // SEND PRIZE
        let isModCoins = updatedGiveaway.skin.title === "Mod Coins";
        let isModCase = updatedGiveaway.skin.title === "Mod Case";
        let isSuperModCase = updatedGiveaway.skin.title === "SUPER Mod Case";
        console.log(updatedGiveaway.skin.price, ' !!!! PRIZE !!!!');
        if (isModCoins) {
          await User.findByIdAndUpdate(
            { _id: winnerUser._id },
            { $inc: { coins: updatedGiveaway.skin.price } }
          );
        } else if (isModCase) {
          await User.findByIdAndUpdate(
            { _id: winnerUser._id },
            { $inc: { modCases: updatedGiveaway.skin.price } }
          );
        } else if(isSuperModCase){
          await User.findByIdAndUpdate(
            { _id: winnerUser._id },
            { $inc: { super_modCases: updatedGiveaway.skin.price } }
          );
        } 
        else {
          const skin = await Skin.create(updatedGiveaway.skin);
          await User.findByIdAndUpdate(
            { _id: winnerUser._id },
            { $push: { skins: skin._id } }
          );
        }

        // Mark the prize as awarded
        updatedGiveaway.beenPaid = true;
        await updatedGiveaway.save();

        // Log the win
        await SystemLog.create({
          type: 0,
          text: `userID: ${updatedGiveaway.winner} won the giveaway: ${updatedGiveaway.skin.title} ${updatedGiveaway.skin.title === "Mod Case" ? "x" + updatedGiveaway.skin.price : updatedGiveaway.skin.title === "Mod Coins" ? "x" + updatedGiveaway.skin.price : ""}`,
          date: newDate(),
        });

        return res.json({ timeLeft: null, giveaway: updatedGiveaway, winUser: winnerUser.username });
      } else {
        if (!giveaway) {
          return;
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
        return res.json({ timeLeft: timeLeftObject, giveaway: giveaway, winUser: null });
      }
    }
  } catch (error) {
    if (res && res.status) {
      return res.status(500).json({ message: "Internal server error" });
    } else {
      console.error(error);
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
        } else if(hasPendingGiveaway === false) {
          
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
        // const exUsers = await User.find({})
        // const userIds = exUsers.map(user => user._id);
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
    let latest = await lastGiveaway.save({ new: true });
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

  export const getLatestDropLogs = async (req, res) => {
    try {
      // Adjusted regex to capture all variations in Super Mod Case and Mod Case drops
      const superDropLogs = await SystemLog.find({
        text: /(\w+) just got a drop from Super Mod Case: (★ .+|\d+x? .+ Coins)/
      })
      .sort({ date: -1 })
      .limit(5);
  
      const dropLogs = await SystemLog.find({
        text: /(\w+) just got a drop from Mod Case: (★ .+|\d+x? .+ Coins)/
      })
      .sort({ date: -1 })
      .limit(5);
  
      // Format the logs
      const superDrops = superDropLogs.map(log => {
        const [, user, item] = log.text.match(/(\w+) just got a drop from Super Mod Case: (★ .+|\d+x? .+ Coins)/);
        return {
          text: item,
          user: user,
          date: log.date,
        };
      });
  
      const drops = dropLogs.map(log => {
        const [, user, item] = log.text.match(/(\w+) just got a drop from Mod Case: (★ .+|\d+x? .+ Coins)/);
        return {
          text: item,
          user: user,
          date: log.date,
        };
      });
  
      res.status(200).json({
        drops,
        superDrops,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

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
      await SystemLog.create(req.body);
      res.status(200).json({ message: "Success" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

// Admin calls CRUD:
export const addAdminCallText = async (req, res) => { 
  try {
      const newAdminCallText = await SystemAdminCall.create(req.body);
      await res.status(200).json({ newAdminCallText: newAdminCallText});
      await SystemLog.create({ type: 0, text: `${req.session.user.username} added a new admin call row in the list.`, date: newDate()})
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

export const getAdminCallsText = async (req, res) => { 
  try {
      const list = await SystemAdminCall.find({})
      await res.status(200).json(list);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}

export const deleteAdmincAllsTextById = async (req, res) => {
  try {
    const { id } = req.params;
    await SystemAdminCall.deleteMany({ _id: { $in: id } });

    res.status(200).json({ message: "Admin call text removed" });
    await SystemLog.create({ type: 0, text: `${req.session.user.username} has removed an admin call text.`, date: newDate()})
  } catch (error) {
    console.error('Error deleting admin calls:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAdminCallText = async (req, res) => {
  try {
    const { id } = req.params; // Assuming the ID is passed as a URL parameter
    const updateData = req.body; // The new data for the systemAdminCall

    const updatedAdminCallText = await SystemAdminCall.findByIdAndUpdate(id, updateData, {
      new: true, // This option returns the modified document rather than the original
      runValidators: true // This option ensures that any validation rules are applied
    });

    if (!updatedAdminCallText) {
      return res.status(404).json({ error: 'SystemAdminCall not found' });
    }
    await SystemLog.create({ type: 0, text: `${req.session.user.username} updated an admin call text.`, date: newDate()})
    return res.status(200).json({ updatedAdminCallText });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const getCasinoConfig = async (req, res) => {
  try {
    const casinoConfig = await SystemCasino.findOne(); // Retrieve the config (assuming there is only one document)
    res.status(200).json(casinoConfig);
  } catch (error) {
    console.error('Error getting casino config:', error);
    throw error; 
  }
};

export const updateCasinoConfig = async (req, res) => {
  const { disableCasino } = req.body;
  try {

    const updatedConfig = await SystemCasino.findOneAndUpdate(
      {}, // Match criteria (empty object to find any document)
      { disableCasino: disableCasino }, // Update field
      { new: true, upsert: true } // 'upsert' creates a new document if none is found
    );
    
    await SystemLog.create({ 
      type: 0, 
      text: `${req.session.user.username} set the casino-disable to: ${disableCasino}`, 
      date: newDate() 
    });

    res.status(200).json(updatedConfig);
  } catch (error) {
    console.error('Error updating casino config:', error);
    res.status(500).json({ error: 'Failed to update casino config' }); 
  }
};

export const updateStats = async (req, res) => {
  const { fieldToUpdate, valueToIncrement } = req.body;
  // Example body:
  //   "fieldToUpdate": "totalRounds.blackjack",
  //   "valueToIncrement": 5
  try {
    // Build the update query dynamically
    const updateQuery = {};
    updateQuery[fieldToUpdate] = valueToIncrement;

    const updatedStats = await SystemStats.findOneAndUpdate(
      {}, // Assuming you only have one system config, so you leave the filter empty
      { $inc: updateQuery }, // Use $inc to increment the field
      { new: true, upsert: true } 
    );

    res.status(200).json({
      success: true,
      data: updatedStats,
    });
  } catch (error) {
    res.status(500).json({error: error.message,});
  }
};

export const getStats = async (req, res) => {
  try {
    const stats = await SystemStats.findOne();
    res.status(200).json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
