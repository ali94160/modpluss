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
  label: { type: String }, 
  text:  { type: String },
  inUse: { type: Boolean }
});

const systemCasinoSchema = new Schema({
  disableCasino: { type: Boolean }
});

const systemStatsSchema = new Schema({
  totalCoins: {
    totalWon: {
      type: Number,
      default: 0,
    },
    totalLost: {
      type: Number,
      default: 0,
    },
    wagered: {
      type: Number,
      default: 0,
    },
  },
  totalRounds: {
    blackjack: {
      type: Number,
      default: 0,
    },
    roulette: {
      type: Number,
      default: 0,
    },
    mines: {
      type: Number,
      default: 0,
    },
  },
  adminStats: {
    totalNameChangesSent: {
      type: Number,
      default: 0,
    },
    totalWarningsRemoved: {
      type: Number,
      default: 0,
    },
    totalLiftedTimeouts: {
      type: Number,
      default: 0,
    },
    totalReports: {
      type: Number,
      default: 0,
    },
    totalTickets: {
      type: Number,
      default: 0,
    },
    totalGiveawaysCreated: {
      type: Number,
      default: 0,
    },
    totalModCasesOpened: {
      type: Number,
      default: 0,
    },
    totalSuperModCasesOpened: {
      type: Number,
      default: 0,
    },
  },
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

export const SystemCasino = mongoose.model(
  "SystemCasino",
  systemCasinoSchema
);

export const SystemStats = mongoose.model(
  "SystemStats",
  systemStatsSchema
);
