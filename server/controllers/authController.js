import { User } from "../models/User.js";
import crypto from "crypto"

export const loginUser = async (req, res) => {
    try {
        if(req.session.user){
            res.status(400).json({ error: "Someone is already logged in"})
            return;
        }
        const hash = crypto.createHmac('sha256', process.env.SECRET_TOKEN).update(req.body.password).digest("hex");

        const user = await User.findOne({ username: req.body.username, password: hash });
        if(!user){
            res.status(404).json({error: "User doesn't exists"})
            return;
        }
        req.session.user = user;
        console.log(user, " Logged in")
        res.status(200).json({ message: "Logged in successfully"});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export const logoutUser = async (req, res) => {
    try {
        if(req.session.user){
            req.session.destroy();
            res.status(200).json({message: "Logged out"})
        } 
        else {
            res.json({message: "User not logged in"})
        } 
    } catch (error) {
        
    }
}

export const whoAmI = async (req, res) => {
    try {
        if (req.session.user) {
            const latestUserData = await User.findOne({ _id: req.session.user._id }).populate('skins').exec();
            req.session.user = latestUserData;
            res.status(200).json(latestUserData);
        } else {
            res.status(404).json({ error: 'Not logged in'});
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}