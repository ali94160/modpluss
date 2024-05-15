import mongoose from "mongoose";
const Schema = mongoose.Schema;

const systemMessageSchema = new Schema({
    text: { type: String , required: true },
    type: { type: Number, required: true }
})


export const SystemMessage = mongoose.model("SystemMessage", systemMessageSchema)