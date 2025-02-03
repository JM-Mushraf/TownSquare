import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    type: {
        type: String,
        enum: ['issue', 'poll', 'general', 'marketplace'],
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    },
    upVotes: {
        type: Number,
        default: 0
    },
    downVotes: {
        type: Number,
        default: 0
    },
    attachments: [
        {
            url: String,
            fileType: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    votedUsers: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            voteType: { type: String, enum: ["upvote", "downvote"] }
        }
    ],

    comments:[{type:mongoose.Schema.Types.ObjectId, ref: "Comment" }]
});

export const Post = mongoose.model("Post", postSchema);
