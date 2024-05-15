import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
    handler:    { type: String, required: true },
    ticketId:   { type: Number, required: true },
    subject:    { type: String, required: true },
    username:   { type: String, required: true },
    resolved:   { type: Number, default: 1     }
})

export const Ticket = mongoose.model("Ticket", ticketSchema);