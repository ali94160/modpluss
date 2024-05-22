import { User } from "../models/User.js";
import mongoose from "mongoose";
import crypto from "crypto"

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
    const users = await User.find({}, { password: 0 }); // { coins: 10 } ="WHERE" - hämtar alla users med coins = 10.
    res.status(200).json(users)
}

// get single user
export const getUser = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({error: "User with Id does not exist"})
        
    const user = await User.findById(id, { password: 0 })
    if(!user) return res.status(404).json({error: "User doesn't exist"})
    res.status(200).json(user);
}   

// register
export const createUser = async (req, res) => {
    try {
        const alreadyExists = await User.findOne({ username: req.body.username})
        if(alreadyExists){
            res.status(409).json({error: "User already exist"})
            return;
        }
        const hash = crypto.createHmac('sha256', process.env.SECRET_TOKEN).update(req.body.password).digest("hex");
        const user = await User.create({ username: req.body.username, password: hash})
        // Logga in när vi skapat kontot.
        if(user) {
            req.session.user = user;
            res.status(200).json(user);
        }
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
            
        const user = await User.findOneAndUpdate(
            { _id: req.session.user._id },
            { 'avatar.borderClass': req.body.border.src },
            { new: true }
        );
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const addCoins = async (req, res) => {
    try {
        const { user, type} = req.body;
        if(req.session.user.username !== user.username) return status(404).json({ error: "User not logged in"});

        if(type === MOD_TYPE.LIFT_REGIONBAN || type === MOD_TYPE.BANNED_USER || type === MOD_TYPE.SENT_NAMECHANGE || type === MOD_TYPE.SOLVED_TICKET) {
            const user = await User.findOneAndUpdate(
                { _id: req.session.user._id },
                { $inc: { coins: 20 } },
                { new: true }
            );
            res.status(200).json(user);
        }
        if(type === MOD_TYPE.ACCEPTED_REPORT || type === MOD_TYPE.DENIED_REPORT || type === MOD_TYPE.LIFT_WARNING) {
            const user = await User.findOneAndUpdate(
                { _id: req.session.user._id },
                { $inc: { coins: 10 } },
                { new: true }
            );
            res.status(200).json(user);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
