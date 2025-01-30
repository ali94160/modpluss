import { SystemLog } from "../models/System.js";
import { Watchlist } from "../models/Watchlist.js";
import { newDate } from "./systemController.js"

export const updateWatchlist = async (req, res) => {
  try {
    const {users} = req.body;

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

  export const deleteWatchlistUser = async (req, res) => {
    try {
      const { id, handler } = req.body;
  
      if (!id) {
        return res.status(400).json({ error: "User ID is required" });
      }
  
      const deletedUser = await Watchlist.findOneAndDelete({ id: +id });
  
      if (!deletedUser) {
        return res.status(404).json({ error: "User not found in the watchlist" });
      }
  
      await SystemLog.create({
        type: 0,
        text: `${handler ? handler : 'unknown'} has removed ${deletedUser.username} from the watchlist`,
        date: newDate(),
      });
     
      const list = await Watchlist.find();

      res.status(200).json(list);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

