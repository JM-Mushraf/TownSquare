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
      enum: ["issue", "poll", "general", "marketplace", "announcements", "survey"],
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
    // Fields for polls
    poll: {
      question: { type: String }, // The poll question
      options: [
        {
          text: { type: String, required: true }, // The text of the option
          votes: { type: Number, default: 0 }, // Number of votes for this option
        },
      ],
      deadline: { type: Date }, // Deadline for the poll
      status: {
        type: String,
        enum: ["active", "upcoming", "past"],
        default: "active",
      }, // Status of the poll
    },
    // Fields for surveys
    survey: {
      questions: [
        {
          question: { type: String, required: true }, // The survey question
          type: { type: String, enum: ["multiple-choice", "open-ended", "rating"], required: true }, // Type of question
          options: [{ type: String }], // Options for multiple-choice questions
        },
      ],
      deadline: { type: Date }, // Deadline for the survey
      status: {
        type: String,
        enum: ["active", "upcoming", "past"],
        default: "active",
      }, // Status of the survey
    },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);