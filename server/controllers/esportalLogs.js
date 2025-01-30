import { CanceledMatch, SmurfLog } from "../models/EsportalLog.js";
import { SystemLog } from "../models/system.js";
import { newDate } from "./systemController.js";

// CANCEL MATCHES
export const createCanceledMatch = async (req, res) => {
  try {
    const canceledMatch = new CanceledMatch(req.body);
    await canceledMatch.save();
    await SystemLog.create({
      //logging
      type: 0,
      text: `${req.body.canceledBy} has canceled match: ${req.body.matchId}`,
      date: newDate(),
    });
    res.status(200).json(canceledMatch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCanceledMatches = async (req, res) => {
  try {
    const canceledMatches = await CanceledMatch.find({});
    res.status(200).json(canceledMatches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const clearCanceledMatches = async (req, res) => {
  try {
    if (!req.session.user)
      res.status(404).json({ error: "User not logged in" });

    await CanceledMatch.deleteMany({});
    await SystemLog.create({
      type: 0,
      text: `${req.session.user?.username} has cleared the canceled match list`,
      date: newDate(),
    });
    res.status(200).json({ message: "Canceled matches cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ESPORTAL LOGS
export const createSmurfLog = async (req, res) => {
   try {
     const smurfLog = new SmurfLog(req.body);
     await smurfLog.save();
     await SystemLog.create({ //logging
       type: 0,
       text: `${req.body.changedBy} ${req.body.text} on userId: ${req.body.userId}`,
       date: newDate(),
     });
     res.status(200).json(smurfLog);
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 };
 
 export const getSmurfLogs = async (req, res) => {
   try {
     const smurfLogs = await SmurfLog.find({});
     res.status(200).json(smurfLogs);
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 };
 
 export const clearSmurfLogs = async (req, res) => {
   try {
     if (!req.session.user)
       res.status(404).json({ error: "User not logged in" });
 
     await SmurfLog.deleteMany({});
     await SystemLog.create({ //logging
      type: 0,
      text: `${req.session.user.username} cleared the smurf logs`,
      date: newDate(),
    });
     res.status(200).json({ message: "smurflogs cleared" });
   } catch (error) {
     res.status(500).json({ error: error.message });
   }
 };
 