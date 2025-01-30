import { Report } from "../models/Report.js";
import { SystemLog } from "../models/System.js";
import { User } from "../models/User.js";
import { newDate } from "./systemController.js";

export const addReport = async (req, res) => {
    try {
        // Find and update the report if it exists, or create a new one if it doesn't
        const report = await Report.findOneAndUpdate(
            { reportId: req.body.reportId }, // Find report by reportId
            req.body, // Update the report with the new data
            { new: true, upsert: true } // Create a new document if none exists
        );

        // Update the user's allTimeReports count
        await User.findOneAndUpdate(
            { username: req.body.handler },
            { $inc: { allTimeReports: 1 } }
        );
        res.status(200).json(report);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

export const getMyReports = async (req, res) => {
try {
    if(!req.session.user){ return res.status(404).json({ error: "User not logged in" }); }
    const reportList = await Report.find({ handler: req.session.user.username });
    res.status(200).json(reportList);
} catch (error) {
    res.status(500).json({ error: error.message }); 
}
}

export const getTotalReports = (req, res) => {
    try {
        if(!req.session.user){ return res.status(404).json({ error: "User not logged in" }); }

        const reportList = Report.find({ handler: req.session.user._id });
        res.status(200).json(reportList);
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
}

export const removeAllReports = async (req, res) => {
    try {
      const result = await Report.deleteMany({});
      await SystemLog.create({ type: 0, text: `${req.session.user.username} has removed everyones reports`, date: newDate()})
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

export const removeMyReports = async (req, res) => {
    try {
      await Report.deleteMany({ handler: req.session.user.username });
      await SystemLog.create({ type: 0, text: `${req.session.user.username} has removed all their reports`, date: newDate()})
      res.status(200).json({ message: "Your reports has been removed" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

export const getAllReportsCount = async (req, res) => {
    try {
        if(!req.session.user){ return res.status(404).json({ error: "User not logged in" }); }

        const allReports = await Report.find({});
        res.status(200).json(allReports.length);
    } catch (error) {
        res.status(500).json({ error: error.message }); 
    }
}