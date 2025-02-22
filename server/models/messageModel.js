import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
    },
    senderId: {
      type: String,
    },
    text: {
      type: String,
    },
    attachments:[
        {
            public_url:String
        }
    ]
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model("Message", MessageSchema);