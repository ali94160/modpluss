import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Define the schema
export const achievementSchema = new Schema({
    src: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String, required: false },
    value: { type: Number, required: true },
  });

// Create a model for the 'achievements' collection
export const Achievement = mongoose.model("Achievement", achievementSchema);