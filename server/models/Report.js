import mongoose from "mongoose";
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    handler:    { type: String, required: true },
    reportId:   { type: Number, required: true },
    category:   { type: String },
    username:   { type: String, required: true },
    status:     { type: Number  }
})

export const Report = mongoose.model("Report", reportSchema);