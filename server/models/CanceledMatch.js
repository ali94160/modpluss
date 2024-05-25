import mongoose from 'mongoose';
const { Schema } = mongoose;

const canceledMatchSchema = new Schema({
    matchId:    { type: Number, required: true },
    canceledAt: { type: Date, default: Date.now },
    canceledBy: { type: String, required: true },
});

export const CanceledMatch = mongoose.model('CanceledMatch', canceledMatchSchema);
