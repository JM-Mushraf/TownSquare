import ErrorHandler from "../utils/errorHandler.js";
import { AsyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/userModel.js";

export const createChat = AsyncHandler(async (req, res,next) => {
    const userId = req.user.id;

    // Fetch the user's county
    const user = await User.findById(userId);
    if (!user || !user.county) {
        return res.status(400).json({ message: "User not found or county not specified" });
    }

    // Find all users in the same county
    const usersInCounty = await User.find({ county: user.county }).select("_id");
    const memberIds = usersInCounty.map(user => user._id.toString());

    // Check if a group chat for this county already exists
    const existingChat = await Chat.findOne({
        members: { $all: memberIds, $size: memberIds.length }
    });

    if (existingChat) {
        return res.status(200).json(existingChat);
    }

    // Create a new group chat for the county
    const newChat = new Chat({
        members: memberIds,
        
        name: `${user.county}`
    });

    const result = await newChat.save();
    return res.status(200).json(new ApiResponse(200, result, "Group chat created successfully"));
});
