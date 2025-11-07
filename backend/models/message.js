import mongoose from "mongoose"
import User from "./user"

const messageSchema = mongoose.Schema (
{
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: True,
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: True,
    },

    content: {
        type: String,
        required: true,
    },
},
{timestamps: true},
);
