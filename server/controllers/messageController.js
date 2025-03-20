import ErrorHandler from "../utils/errorHandler.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/userModel.js";
import { Chat } from "../models/chatModel.js";
import { Message } from "../models/messageModel.js"; 


export const sendMessage = AsyncHandler(async (req, res, next) => {
    const { chatId, content } = req.body;
    const userId = req.user._id;
  
    if (!chatId || !content) {
      throw new ErrorHandler("Chat ID and message content are required", 400);
    }
  
    const chat = await Chat.findById(chatId);
  
    if (!chat) {
      throw new ErrorHandler("Chat not found", 404);
    }
  
    const newMessage = await Message.create({
      chat: chatId,
      sender: userId,
      content,
    });
  
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      newMessage,
    });
  });




  export const fetchMessages = AsyncHandler(async (req, res, next) => {
    const { chatId } = req.params;
    const { page = 1, limit = 20 } = req.query;
  
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  
    res.status(200).json({
      success: true,
      messages,
    });
  });