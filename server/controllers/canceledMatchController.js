import { CanceledMatch } from "../models/CanceledMatch.js";

export const createCanceledMatch = async (req, res) => {
   try {
    const canceledMatch = new CanceledMatch(req.body);
    await canceledMatch.save();
    res.status(200).json(canceledMatch);
   } catch (error) {
    res.status(500).json({ error: error.message })
   }
}

export const getCanceledMatches = async (req, res) => {
   try {
    const canceledMatches = await CanceledMatch.find({});
    res.status(200).json(canceledMatches);
   } catch (error) {
    res.status(500).json({ error: error.message })
   }
}