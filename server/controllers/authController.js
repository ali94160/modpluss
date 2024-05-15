import { User } from "../models/User.js";


export const loginUser = async (req, res) => {
    try {
        if(req.session.user){
            res.status(400).json({ error: "Someone is already logged in"})
            return;
        }
        const user = await User.findOne({username: req.body.username});
        if(!user){
            res.status(400).json({error: "User doesn't exists"})
            return;
        }

        req.session.user = user;
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
            res.status(200).json(latestUserData);
        } else {
            res.json('Not logged in');
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}