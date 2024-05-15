import mongoose from "mongoose";
import { skinSchema } from "./Skin.js";
const Schema = mongoose.Schema;

export const avatarSchema = new Schema({
  src: { type: String, default: "classic_knife-1" },
  borderClass: { type: String, default: "avatar-0" },
});

export const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  country_id: { type: Number, default: 0 },
  flag: { type: Number, default: 0 },
  allTimeTickets: { type: Number, default: 0 },
  coins: { type: Number, default: 0 },
  modCases: { type: Number, default: 0 },
  skins: [{ type: Schema.Types.ObjectId, ref: 'Skin' }],
  avatar: { type: avatarSchema },
});

export const User = mongoose.model("User", userSchema);
