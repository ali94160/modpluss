import { SystemMessage } from "../models/System.js";


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