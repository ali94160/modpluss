import { Report } from "../models/Report.js";
import { User } from "../models/User.js";

export const addReport = async (req, res) => {
    try {
        const report = await Report.create(req.body);
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
      res.status(200).json(result);
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