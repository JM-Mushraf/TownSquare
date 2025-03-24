import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
    name: String,
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
}, {
    timestamps: true,
});

export const Chat = mongoose.model("Chat", ChatSchema);