import { User } from "../models/User.js";
import mongoose from "mongoose";
import crypto from "crypto"
import { newDate } from "./systemController.js";
import { SystemLog } from "../models/System.js";

const MOD_TYPE = {
    SOLVED_TICKET: "SOLVED_TICKET",
    LIFT_WARNING: "LIFT_WARNING",
    LIFT_REGIONBAN: "LIFT_REGIONBAN",
    SENT_NAMECHANGE: "SENT_NAMECHANGE",
    ACCEPTED_REPORT: "ACCEPTED_REPORT",
    DENIED_REPORT: "DENIED_REPORT",
    BANNED_USER: "BANNED_USER",
}

// Get all users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }).populate('skins');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get single user
export const getUser = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({error: "User with Id does not exist"})
        
    const user = await User.findById(id, { password: 0 })
    if(!user) return res.status(404).json({error: "User doesn't exist"})
    res.status(200).json(user);
}   

// get single user by username - used in contentScript
export const getUserByUsername = async (req, res) => {
    try {
        const {username}  = req.params;
            
        const user = await User.findOne({ username }, { password: 0 }).populate('Achievements');
        if(!user) return res.status(404).json({error: "User doesn't exist"})
        res.status(200).json(user);
        
    } catch (error) {
        await SystemLog.create({
            type: 1, 
            text: `UserController.getUserByUsername: ${error?.message}`, 
            date: newDate()
        });
        res.status(404).json({ error: error.message });
    }
}

// register
export const createUser = async (req, res) => {
    try {
        const alreadyExists = await User.findOne({ username: req.body.username})
        if(alreadyExists){
            res.status(409).json({error: "User already exist"})
            return;
        }
        if(req.body.password.length < 3) return res.status(407).json({error: "Password too short"})
        const hash = crypto.createHmac('sha256', process.env.SECRET_TOKEN).update(req.body.password).digest("hex");
        const user = await User.create({ username: req.body.username, role_type: req.body.role_type, password: hash})
        // Logga in när vi skapat kontot.
        if(user) {
            req.session.user = user;
            res.status(200).json(user);

            await SystemLog.create({
                type: 0, 
                text: `${user.username} has registred`, 
                date: newDate()
            });
        }
    } catch (error) {
        await SystemLog.create({
            type: 1, 
            text: `${req.body.username}: ${error.message}`, 
            date: newDate()
        });
        res.status(400).json({ error: error.message });
    }
}

export const changePassword = async (req, res) => {
    try {
        if(!req.session.user){
            return res.status(404).json({ error: "Not logged in" });
        }
        const user = await User.findById(req.session.user._id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (!user._id.equals(new mongoose.Types.ObjectId(req.session.user._id))) {
            return res.status(409).json({ error: "Unauthorized" });
        }
        // Check if the new password meets the length requirement
        if (req.body.newPass.length < 3) {
            return res.status(407).json({ error: "Password too short" });
        }
        // Hash the new password
        const newHash = crypto.createHmac('sha256', process.env.SECRET_TOKEN).update(req.body.newPass).digest("hex");

        // Update the user's password
        user.password = newHash;
        await user.save();

        // Log the password change
        await SystemLog.create({
            type: 0, 
            text: `${req.session.user.username} changed their password.`, 
            date: newDate()
        });

        // Send a success response
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const updateUserPassword = async (req, res) => {
    try {
        // Find the user by ID
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            await SystemLog.create({
                type: 1, 
                text: `${req.session.user.username} failed to update password on _id: ${id} - User not found`, 
                date: newDate()
            });
            return res.status(402).json({ error: "User not found" });
        }
        // Check if the new password meets the length requirement
        if (req.body.newPassword.length < 3) {
            return res.status(407).json({ error: "Password too short" });
        }
        // Hash the new password
        const newHash = crypto.createHmac('sha256', process.env.SECRET_TOKEN).update(req.body.newPassword).digest("hex");

        // Update the user's password
        user.password = newHash;
        await user.save();

        // Log the password change
        await SystemLog.create({
            type: 0, 
            text: `${req.session.user.username} updated ${user.username}'s password`, 
            date: newDate()
        });

        // Send a success response
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// update a user
export const updateUser = async (req, res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({error: "User with Id does not exist"})

    const user = await User.findOneAndUpdate({_id: id}, {
        ...req.body
    }, { new: true })

    if(!user) return res.status(404).json({error: "User doesn't exist"})
    res.status(200).json(user);
}

// update a users queue permission
export const updateUserQueuePermission = async (req, res) => {
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({error: "User with Id does not exist"})

    const user = await User.findOneAndUpdate({_id: id}, {
        ...req.body
    }, { new: true })

    if(!user) return res.status(404).json({error: "User doesn't exist"})
    res.status(200).json(user);
}

// update all users
export const updateAllUsers = async (req, res) => {
    try {
        const {coins, modCases} = req.body;
        const result = await User.updateMany({}, { $inc: { coins, modCases }  });
    
        if(!result) return res.status(404).json({error: "No users to update"})
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// update user-avatar
export const updateAvatar = async (req, res) => {
    try {
        if(!mongoose.Types.ObjectId.isValid(req.session.user._id)) return res.status(404).json({error: "User with Id does not exist"})
        const user = await User.findOneAndUpdate(
            { _id: req.session.user._id },
            { 'avatar.src': req.body.src },
            { new: true }
        );
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const updateAvatarBorder = async (req, res) => {
    try {
        if(!mongoose.Types.ObjectId.isValid(req.session.user._id)) return res.status(404).json({error: "User with Id does not exist"})
            console.log(req.body.border, ' REQ BODY BORDER!!!')
        const user = await User.findOneAndUpdate(
            { _id: req.session.user._id },
            { 'avatar.borderClass': req.body.border },
            { new: true }
        );
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const addCoins = async (req, res) => {
    try {
        const { username, type } = req.body;
        if(!username) return status(404).json({ error: "User not found"});
        if(type === MOD_TYPE.LIFT_REGIONBAN || type === MOD_TYPE.BANNED_USER || type === MOD_TYPE.SENT_NAMECHANGE || type === MOD_TYPE.SOLVED_TICKET) {
            const user = await User.findOneAndUpdate(
                { username: username },
                { $inc: { coins: 75 } },
                { new: true }
            );
            res.status(200).json(user);
        }
        if(type === MOD_TYPE.ACCEPTED_REPORT || type === MOD_TYPE.DENIED_REPORT || type === MOD_TYPE.LIFT_WARNING) {
            const user = await User.findOneAndUpdate(
                { username: username },
                { $inc: { coins: 35 } },
                { new: true }
            );
            res.status(200).json(user);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const updateBalance = async (req, res) => {
    try {
        const { balanceNew, game } = req.body;
        if (req.session.user) {
            const user = await User.findOneAndUpdate(
                { username: req.session.user.username },
                { $set: { coins: balanceNew } }, 
                { new: true }
            );
            res.status(200).json(user.coins);
        } else {
            await SystemLog.create({ 
                type: 1, 
                text: `No user in session found`, 
                date: newDate() 
            });
            res.status(404).json({ error: "No user in session." });
        }
    } catch (error) {
        // Log any errors
        await SystemLog.create({ 
            type: 1, 
            text: `${error.message} - failed to update coins`, 
            date: newDate() 
        });
        res.status(500).json({ error: error.message });
    }
}



// top 10 tickets
// Get all users
export const getTopTickets = async (req, res) => {
    try {
        const top10 = await User.find({}, { password: 0, skins: 0 })
        .sort({ allTimeTickets: -1 })
        .limit(10);
        res.status(200).json(top10);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getTopReports = async (req, res) => {
    try {
        const top10 = await User.find({}, { password: 0, skins: 0 })
        .sort({ allTimeReports: -1 })
        .limit(10);
        res.status(200).json(top10);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const addAvatarBorder = async (req, res) => { // buying avatarBorder
    try {
        if(!req.session.user) return res.status(404).json({ error: "User not logged in" });
        console.log(req.body, ' req body!')
        if(req.session.user.coins < req.body.price) return res.status(400).json({ error: "You don't have enough Mod Coins" });
        req.session.user.coins -= req.body.price;

        const user = await User.findOneAndUpdate(
            { _id: req.session.user._id },
            { $push: { avatars: req.body },
            coins: req.session.user.coins, },
            { new: true }
        );
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const setHandleRole = async (req, res) => {
    try {
        // Await the User.findOneAndUpdate call
        const user = await User.findOneAndUpdate(
            { _id: req.session.user._id },
            { handleRole: req.body.nr },
            { new: true }
        ).hint({ $natural: -1 }) // Force MongoDB to ignore cache and perform a fresh query
        
        await SystemLog.create({
            type: 0, 
            text: `${req.session.user.username} set role team number to: ${req.body.nr}`, 
            date: newDate()
          });
          
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getDailyCaseReward = async (req, res) => {
    try {
      // Get the current user
      const user = await User.findById(req.session.user._id);
  
      // Get the current date and only keep year, month, and day (ignoring time)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to midnight for comparison
  
      // Check if the user has already claimed today
      const lastClaimed = new Date(user.lastClaimed);
      lastClaimed.setHours(0, 0, 0, 0); // Also normalize the lastClaimed date
  
      if (lastClaimed.getTime() === today.getTime()) {
        return res.status(400).json({ message: "You have already claimed your daily reward today." });
      }
  
      // If not claimed today, increment modCases and update lastClaimed
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.session.user._id },
        {
          $inc: { modCases: 1 },
          $set: { lastClaimed: new Date() }, // Update lastClaimed to current date
        },
        { new: true }
      ).hint({ $natural: -1 }); // Force MongoDB to ignore cache and perform a fresh query
      
      await SystemLog.create({
        type: 0,
        text: `${req.session.user.username} has claimed their daily case reward`,
        date: newDate()
      });
      
      res.status(200).json(updatedUser); 
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  