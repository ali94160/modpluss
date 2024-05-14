import mongoose from "mongoose";

const Schema = mongoose.Schema;
export const skinSchema = new Schema({
    src: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    }
})

export const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    country_id: {
        type: Number
    },
    flag: {
        type: Number,
        required: true
    },
    allTimeTickets: {
        type: Number
    },
    coins: {
        type: Number
    },
    modCases: {
        type: Number
    },
    skins: {
        type: [skinSchema]
    }
}) 

export const Skin = mongoose.model("Skin", skinSchema);
export const User = mongoose.model("User", userSchema);