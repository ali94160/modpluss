import mongoose from "mongoose";
import { skinSchema } from "./Skin.js";
const Schema = mongoose.Schema;

export const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  country_id: { type: Number, default: 0 },
  role_type: { type: Number },
  flag: { type: Number, default: 0 },
  handleRole: { type: Number, default: 0 }, // 0 = no ticket or report, 1 = ticket, 2 = report, 3 = both
  allTimeTickets: { type: Number, default: 0 },
  allTimeReports: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  modCases: { type: Number, default: 1 },
  lastClaimed: { type: Date, default: null },
  queue: { type: Number, default: 0},
  skins: [{ type: Schema.Types.ObjectId, ref: "Skin" }],
  avatars: {
    type: [
      {
        title: { type: String, default: "Avatar | Classic" },
        price: { type: Number, default: 0 },
        borderClass: { type: String, default: "avatar-0" },
      },
    ],
    default: [
      {
        title: "Frame | Classic",
        price: 0,
        borderClass: "avatar-0",
      },
    ],
  },
  avatar: {
    src: { type: String, default: "classic_knife-1" },
    borderClass: { type: String, default: "avatar-0" },
  },
  achievements: [{ type: Schema.Types.ObjectId, ref: "Achievement", default: [] }],
  selectedAchievement: { type: Schema.Types.ObjectId, ref: "Achievement", default: null }
});

export const User = mongoose.model("User", userSchema);
