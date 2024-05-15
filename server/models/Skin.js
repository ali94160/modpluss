import mongoose from "mongoose";
const Schema = mongoose.Schema;

export const skinSchema = new Schema({
  src: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
});

export const Skin = mongoose.model("Skin", skinSchema);
