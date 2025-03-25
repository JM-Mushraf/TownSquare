import ErrorHandler from "../utils/errorHandler.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/userModel.js";
import { Chat } from "../models/chatModel.js";
import { Message } from "../models/messageModel.js"; 


import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

export const sendMessage = AsyncHandler(async (req, res, next) => {
  const { chatId, content } = req.body;
  const userId = req.user._id;
  const files = req.files?.attachments;

  if (!chatId || (!content && !files)) {
    throw new ErrorHandler("Chat ID and either message content or file are required", 400);
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ErrorHandler("Chat not found", 404);
  }

  // Upload attachments if any
  let attachments = [];
  if (files) {
    const uploadPromises = Array.isArray(files) 
      ? files.map(file => uploadOnCloudinary(file.path))
      : [uploadOnCloudinary(files.path)];

    const uploadResults = await Promise.all(uploadPromises);
    attachments = uploadResults.map(result => ({
      url: result.secure_url,
      fileType: result.resource_type,
      fileName: result.original_filename,
      fileSize: result.bytes,
      publicId: result.public_id
    }));
  }

  const newMessage = await Message.create({
    chat: chatId,
    sender: userId,
    content: content || "",
    attachments
  });

  // Populate sender details
  await newMessage.populate("sender", "username avatar");

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

export const deleteMessage = AsyncHandler(async (req, res, next) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ErrorHandler("Message not found", 404);
  }

  // Check if user is the sender
  if (message.sender.toString() !== userId.toString()) {
    throw new ErrorHandler("Unauthorized to delete this message", 403);
  }

  // Delete attachments from Cloudinary if any
  if (message.attachments.length > 0) {
    const deletePromises = message.attachments.map(attachment => 
      deleteFromCloudinary(attachment.publicId)
    );
    await Promise.all(deletePromises);
  }

  await Message.findByIdAndDelete(messageId);

  res.status(200).json({
    success: true,
    message: "Message deleted successfully",
  });
});