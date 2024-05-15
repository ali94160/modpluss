import { User } from "../models/User.js";
import mongoose from "mongoose";
import crypto from "crypto"

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