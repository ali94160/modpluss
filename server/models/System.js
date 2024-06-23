import mongoose from "mongoose";
const Schema = mongoose.Schema;

const systemMessageSchema = new Schema({
  text: { type: String, required: true },
  type: { type: Number, required: true },
});

const systemGiveawaySchema = new Schema({
  skin: {
    src: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
  },
  entries: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  winner: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  hasWinner: { type: Boolean, default: false },
  beenPaid: { type: Boolean, default: false },
  isDone: { type: Boolean, default: false },
});

const systemLogSchema = new Schema({
  type: { type: Number },
  text: { type: String },
  date: { type: String }
});

const systemAdminCallSchema = new Schema({
  label: { type: String , required: true }, 
  text:  { type: String, required: true },
  inUse: { type: Boolean, required: true }
});

export const SystemMessage = mongoose.model(
  "SystemMessage",
  systemMessageSchema
);

export const SystemGiveaway = mongoose.model(
    "SystemGiveaway",
    systemGiveawaySchema
  );

export const SystemAdminCall = mongoose.model(
  "SystemAdminCall",
  systemAdminCallSchema
);

export const SystemLog = mongoose.model(
  "SystemLog",
  systemLogSchema
);
