import { Watchlist } from "../models/Watchlist.js";

export const updateWatchlist = async (req, res) => {
  try {
    const users = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: "Invalid input. Provide an array of users." });
    }

    await Watchlist.deleteMany({});

    const newUsers = await Watchlist.insertMany(users);

    res.status(200).json(newUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getWatchlist = async (req, res) => {
    try {
      const watchlist = await Watchlist.find();
  
      res.status(200).json(watchlist);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

