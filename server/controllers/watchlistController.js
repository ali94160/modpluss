import { Watchlist } from "../models/Watchlist.js";

export const updateWatchlist = async (req, res) => {
  try {
    const users = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: "Invalid input. Provide an array of users." });
    }

    // Fetch existing users from the database
    const existingUsers = await Watchlist.find({
      id: { $in: users.map((user) => user.id) },
    });

    // Prepare bulk operations with change detection and logging
    const operations = users.map((user) => {
      const existingUser = existingUsers.find((eu) => eu.id === user.id);
      const logs = [];

      if (existingUser) {
        // Compare fields and log changes
        if (user.reports > existingUser.reports) {
          logs.push("Has received a report");
        }
        if (user.user_bans > existingUser.user_bans) {
          logs.push(`Has been banned`);
        }
        if (user.warnings > existingUser.warnings) {
          logs.push("Has received a warning");
        }
        if (user.matches_played > existingUser.matches_played) {
          logs.push("Has played more matches");
        }
        if(user.username != existingUser.username && user.id == existingUser.id){
          logs.push(`Has changed their username to ${user.username} from: ${existingUser.username}`);
        }
        if(user.reported > existingUser.reported){
          logs.push("Has reported another player");
        }
        if(user.gathers_played > existingUser.gathers_played){
          logs.push("Has played more gathers");
        }
        if(user.tickets > existingUser.tickets){
          logs.push("Has created more tickets");
        }
      }

      return {
        updateOne: {
          filter: { id: user.id }, // Match by the unique `id`
          update: {
            $set: user, // Update with new data
            $push: {
              logs: logs.map((text) => ({ text })), // Add logs to the `logs` array
            },
          },
          upsert: true, // Create new document if no match is found
        },
      };
    });

    // Perform bulk write
    const updatedList = await Watchlist.bulkWrite(operations);
    res.status(200).json(updatedList);
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

