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
  const chats = await Chat.find({ name: { $in: user.communitiesJoined } }).populate({
    path: 'members',
    select: 'username avatar' // you can also add email, _id, etc. if needed
  });

  res.status(200).json({
    success: true,
    chats,
  });
});


export const getCommunities=async(req,res)=>{
  try {
    const { names } = req.query;
    const communityNames = Array.isArray(names) ? names : [names].filter(Boolean);
    
    const communities = await Chat.find({ name: { $in: communityNames } });
    res.status(200).json({ success: true, communities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}


// Add this to your chatController.js

/**
 * @description Get all members of a specific chat
 * @route GET /chat/members/:chatId
 * @access Private (only members of the chat)
 */
export const getChatMembers = AsyncHandler(async (req, res, next) => {
  const { chatId } = req.params;

  // Find the chat and populate members with basic info
  const chat = await Chat.findById(chatId)
    .populate({
      path: 'members',
      select: 'username avatar email location.county isVerified' // Select the fields you want to include
    })
    .select('members admin'); // Only return members and admin fields

  if (!chat) {
    throw new ErrorHandler("Chat not found", 404);
  }

  // Check if the requesting user is a member of the chat
  const isMember = chat.members.some(member => member._id.toString() === req.user._id.toString());
  if (!isMember) {
    throw new ErrorHandler("Unauthorized access to chat members", 403);
  }

  // Format the response to include member info and admin status
  const members = chat.members.map(member => ({
    _id: member._id,
    username: member.username,
    avatar: member.avatar,
    email: member.email,
    county: member.location?.county,
    isVerified: member.isVerified,
    isAdmin: chat.admin?.toString() === member._id.toString()
  }));

  res.status(200).json({
    success: true,
    members,
    adminId: chat.admin
  });
});

/**
 * @description Add members to a chat (admin only)
 * @route POST /chat/:chatId/members
 * @access Private (only admin of the chat)
 */
export const addChatMembers = AsyncHandler(async (req, res, next) => {
  const { chatId } = req.params;
  const { memberIds } = req.body; // Array of user IDs to add

  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    throw new ErrorHandler("Please provide valid member IDs", 400);
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ErrorHandler("Chat not found", 404);
  }

  // Check if the requesting user is the admin of the chat
  if (chat.admin?.toString() !== req.user._id.toString()) {
    throw new ErrorHandler("Only chat admin can add members", 403);
  }

  // Verify all users exist
  const existingUsers = await User.find({ _id: { $in: memberIds } });
  if (existingUsers.length !== memberIds.length) {
    throw new ErrorHandler("One or more users not found", 404);
  }

  // Filter out members that are already in the chat
  const newMembers = memberIds.filter(id => 
    !chat.members.includes(id)
  );

  if (newMembers.length === 0) {
    throw new ErrorHandler("All users are already members of this chat", 400);
  }

  // Add new members
  chat.members.push(...newMembers);
  await chat.save();

  res.status(200).json({
    success: true,
    message: `${newMembers.length} new members added to the chat`,
    chat
  });
});


export const removeChatMembers = AsyncHandler(async (req, res, next) => {
  const { chatId } = req.params;
  const { memberIds } = req.body; // Array of user IDs to remove

  if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
    throw new ErrorHandler("Please provide valid member IDs", 400);
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ErrorHandler("Chat not found", 404);
  }

  // Check if the requesting user is the admin of the chat
  if (chat.admin?.toString() !== req.user._id.toString()) {
    throw new ErrorHandler("Only chat admin can remove members", 403);
  }

  // Prevent admin from removing themselves
  if (memberIds.includes(req.user._id.toString())) {
    throw new ErrorHandler("Admin cannot remove themselves from the chat", 400);
  }

  // Filter out members that are not in the chat
  const membersToRemove = memberIds.filter(id => 
    chat.members.includes(id)
  );

  if (membersToRemove.length === 0) {
    throw new ErrorHandler("No matching members found in this chat", 400);
  }

  // Remove members
  chat.members = chat.members.filter(member => 
    !membersToRemove.includes(member.toString())
  );
  await chat.save();

  res.status(200).json({
    success: true,
    message: `${membersToRemove.length} members removed from the chat`,
    chat
  });
});