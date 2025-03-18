import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["issue", "poll", "general", "marketplace", "announcements"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    upVotes: {
      type: Number,
      default: 0,
    },
    downVotes: {
      type: Number,
      default: 0,
    },
    important: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        url: { type: String, required: true },
        fileType: { type: String, required: true },
        publicId: { type: String },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    votedUsers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        voteType: { type: String, enum: ["upvote", "downvote"] },
      },
    ],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    solutions: [
        {
            text: { type: String, required: true },
            votes: { type: Number, default: 0 },
        }
    ]    
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);