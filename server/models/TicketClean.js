import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ticketClean = new Schema({
    isTicketsClearedForThisMonth: { type: Boolean, default: false }
})

export const TicketClean = mongoose.model("TicketClean", ticketClean)