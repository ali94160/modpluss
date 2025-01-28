import mongoose from "mongoose";
const Schema = mongoose.Schema;

export const watchlistSchema = new Schema({
  handler: { type: String },
  handler_role: { type: Number, default: 0 },
  startDate: { type: String },
  reason: { type: String, default: "" },
  username: { type: String },
  id: { type: Number },
  is_banned: { type: Boolean, default: false },
  reported: { type: Number, default: 0 },
  reports: { type: Number, default: 0 },
  user_bans: { type: Number, default: 0 },
  warnings: { type: Number, default: 0 },
  online_status: { type: Number, default: 0 },
  matches_played: { type: Number, default: 0 },
  gathers_played: { type: Number, default: 0 },
  tickets: { type: Number, default: 0 },
  username_history: { type: Number, default: 0 },
  logs: [{ type: String }]
});

export const Watchlist = mongoose.model("Watchlist", watchlistSchema);
