import ErrorHandler from "../utils/errorHandler.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/userModel.js";
import { Chat } from "../models/chatModel.js";

export const createChat = AsyncHandler(async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch the user's details
    const user = await User.findById(userId);
    if (!user || !user.location || !user.location.county) {
      throw new ErrorHandler("User not found or location details not specified", 400);
    }

    // Find all users in the same county
    const usersInCounty = await User.find({ "location.county": user.location.county }).select("_id");
    const memberIds = usersInCounty.map(user => user._id.toString());

    // Check if a group chat for this county already exists
    let existingChat = await Chat.findOne({
      name: user.location.county,
    });

    if (!existingChat) {
      // If no chat exists, create a new group chat for the county
      existingChat = new Chat({
        name: user.location.county,
        members: memberIds,
      });
      await existingChat.save();
    } else {
      // If the chat exists, add the new user to the chat
      if (!existingChat.members.includes(userId)) {
        existingChat.members.push(userId);
        await existingChat.save();
      }
    }

    // Return the chat data instead of sending a response
    return existingChat;
  } catch (error) {
    // Pass the error to the error-handling middleware
    next(error);
  }
});

export const getChatDetails = AsyncHandler(async (req, res, next) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId).populate("members", "username avatar");

  if (!chat) {
    throw new ErrorHandler("Chat not found", 404);
  }

  res.status(200).json({
    success: true,
    chat,
  });
});



export const listUserChats = AsyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Find the user and get their communitiesJoined (chat names)
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  // Fetch chat details for each chat name in communitiesJoined
  const chats = await Chat.find({ name: { $in: user.communitiesJoined } });

  res.status(200).json({
    success: true,
    chats,
  });
});