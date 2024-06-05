import mongoose from 'mongoose';
const { Schema } = mongoose;

const canceledMatchSchema = new Schema({
    matchId:    { type: Number, required: true },
    canceledAt: { type: Date, default: Date.now },
    canceledBy: { type: String, required: true },
});

export const CanceledMatch = mongoose.model('CanceledMatch', canceledMatchSchema);

const smurfLogSchema = new Schema({
    userId:   { type: Number, required: true },
    changedBy: { type: String, required: true },
    username: { type: String },
    text:     { type: String, required: true },
    date:     { type: Date, default: Date.now },
});

export const SmurfLog = mongoose.model('SmurfLog', smurfLogSchema);