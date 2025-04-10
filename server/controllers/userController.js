import { AsyncHandler } from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/userModel.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import { sendToken } from "../middlewares/jwtToken.js";
import { ApiResponse } from "../routes/apiResponse.js";
import { sendMail } from "../nodemailer/nodemailer.js";
import { Location } from "../models/locationModel.js";
import { createChat } from "./chatController.js";
import { Chat } from "../models/chatModel.js";
import { Post } from "../models/postModel.js";
import { Message } from "../models/messageModel.js";
import mongoose from "mongoose";
import { Comment } from "../models/commentModel.js";
export const registerUser = AsyncHandler(async (req, res, next) => {
  const { username, email, password, role, phone, address, city, district, county, postcode } = req.body;

  if (!username || !email || !password || !role || !address || !city || !district || !county || !postcode) {
    throw new ErrorHandler("All fields are required", 400);
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }, { phone }] });
  if (existedUser) {
    throw new ErrorHandler("Username, email, or phone already exists", 409);
  }

  const avatarFile = req.files?.avatar?.[0];
  if (!avatarFile) {
    throw new ErrorHandler("Avatar file is required", 400);
  }

  const uploadedAvatar = await uploadOnCloudinary(avatarFile.path);
  if (!uploadedAvatar) {
    throw new ErrorHandler("Error uploading avatar file", 500);
  }

  const verificationCode = await sendMail(email);

  req.session.verificationData = {
    username,
    email,
    password,
    role,
    phone,
    location: { address, city, district, county, postcode },
    avatar: { url: uploadedAvatar.url, publicId: uploadedAvatar.public_id },
    verificationCode,
  };

  res.status(200).json({
    success: true,
    message: "Verification code sent to your email. Please verify to complete registration.",
  });
});

export const verifyUser = AsyncHandler(async (req, res, next) => {
  const { verificationCode } = req.body;
  const verificationData = req.session.verificationData;

  if (!verificationData) {
    throw new ErrorHandler("No registration process found. Please register again.", 400);
  }

  if (verificationData.verificationCode !== Number(verificationCode)) {
    if (verificationData.avatar.publicId) {
      await deleteFromCloudinary(verificationData.avatar.publicId);
    }
    throw new ErrorHandler("Invalid verification code", 400);
  }

  const { username, email, password, role, phone, location, avatar } = verificationData;

  // Create the new user
  const newUser = await User.create({
    username,
    email,
    password,
    role,
    phone,
    location,
    avatar: avatar.url,
    avatarPublicId: avatar.publicId,
    communitiesJoined: [location.county], // Add the county name to communitiesJoined
  });

  // Clear the session data
  req.session.verificationData = null;

  // Check if the location (county, postcode, city) already exists
  let existingLocation = await Location.findOne({
    county: location.county,
    postcode: location.postcode,
    city: location.city,
  });

  if (!existingLocation) {
    // If the location doesn't exist, create a new entry
    existingLocation = await Location.create({
      county: location.county,
      postcode: location.postcode,
      city: location.city,
    });
  }

  // Call the createChat function to handle chat creation (if needed)
  req.user = { id: newUser._id }; // Simulate the user being logged in
  await createChat(req, res, next); // This will handle chat creation for unique locations

  // Send a single response
  res.status(201).json({
    success: true,
    message: "Your email has been successfully verified! Welcome to TownSquare!",
    user: newUser,
  });
});


export const loginUser = AsyncHandler(async (req, res, next) => {
  try {
    const { email, password, location } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Please enter email and password", 400));
    }

    // Find user by email and include password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    // Validate password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }

    // Update location if provided
    if (location) {
      user.location = location;
      await user.save(); // Save updated location
    }

    // If email and password matched, send token
    sendToken(user, 200, res);

  } catch (error) {
    console.log(error);
    return next(
      new ErrorHandler(
        error.message || "Internal server error",
        error.statusCode || 500
      )
    );
  }
});

export const logoutUser=AsyncHandler(async(req,res,next)=>{
  res.cookie('token',null,{
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,
  });
  res.status(200).json(new ApiResponse(200, {}, "user LoggedOut Successfully"));
})
export const getUserDetails = AsyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized: User ID not found");
  }

  const user = await User.findById(userId).select("-password -verificationCode");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User details fetched successfully"));
});



export const deleteUser = AsyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  
  if (!userId) {
    throw new ApiError(401, "Unauthorized: User ID not found");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Delete all messages sent by the user
    await Message.deleteMany({ sender: userId }).session(session);

    // 2. Handle chats where user is a member
    const chats = await Chat.find({ members: userId }).session(session);
    for (const chat of chats) {
      // Remove user from members array
      chat.members = chat.members.filter(member => !member.equals(userId));
      
      if (chat.members.length === 0) {
        // Delete chat if no members left
        await Chat.findByIdAndDelete(chat._id).session(session);
      } else {
        await chat.save({ session });
      }
    }

    // 3. Delete all comments by the user and remove references from posts
    await Comment.deleteMany({ userId: userId }).session(session);
    await Post.updateMany(
      { comments: { $in: await Comment.find({ userId: userId }).distinct('_id') } },
      { $pull: { comments: { $in: await Comment.find({ userId: userId }).distinct('_id') } } },
      { session }
    );

    // 4. Handle posts created by the user
    const userPosts = await Post.find({ createdBy: userId }).session(session);
    for (const post of userPosts) {
      // First delete all comments on these posts
      await Comment.deleteMany({ postId: post._id }).session(session);
      // Then delete the post
      await Post.findByIdAndDelete(post._id).session(session);
    }

    // 5. Remove user references from other posts (votes, polls, surveys, etc.)
    await Post.updateMany(
      {},
      [
        {
          $set: {
            "votedUsers": {
              $filter: {
                input: "$votedUsers",
                as: "voter",
                cond: { $ne: ["$$voter.userId", userId] }
              }
            },
            "poll.options.votedBy": {
              $map: {
                input: "$poll.options.votedBy",
                as: "option",
                in: {
                  $filter: {
                    input: "$$option",
                    as: "voter",
                    cond: { $ne: ["$$voter.userId", userId] }
                  }
                }
              }
            },
            "survey.questions": {
              $map: {
                input: "$survey.questions",
                as: "question",
                in: {
                  $mergeObjects: [
                    "$$question",
                    {
                      votes: {
                        $filter: {
                          input: "$$question.votes",
                          as: "vote",
                          cond: { $ne: ["$$vote.userId", userId] }
                        }
                      },
                      responses: {
                        $filter: {
                          input: "$$question.responses",
                          as: "response",
                          cond: { $ne: ["$$response.userId", userId] }
                        }
                      },
                      ratings: {
                        $filter: {
                          input: "$$question.ratings",
                          as: "rating",
                          cond: { $ne: ["$$rating.userId", userId] }
                        }
                      }
                    }
                  ]
                }
              }
            },
            "marketplace.contactMessages": {
              $filter: {
                input: "$marketplace.contactMessages",
                as: "message",
                cond: { $ne: ["$$message.userId", userId] }
              }
            }
          }
        }
      ],
      { session, multi: true }
    );

    // 6. Finally, delete the user
    await User.findByIdAndDelete(userId).session(session);

    await session.commitTransaction();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "User account and all associated data deleted successfully"));

  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(500, `Failed to delete user account: ${error.message}`);
  } finally {
    session.endSession();
  }
});




export const getUserActivities = AsyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  
  if (!userId) {
    throw new ErrorHandler("Unauthorized: User ID not found", 401);
  }

  try {
    // Get user details
    const user = await User.findById(userId).select("-password -verificationCode");
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    // Get all posts created by the user, sorted by newest first
    const posts = await Post.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username avatar')
      .lean(); // Convert to plain JavaScript objects

    // Categorize posts by type
    const categorizedPosts = {
      all: posts,
      regular: posts.filter(post => post.type === 'regular'),
      poll: posts.filter(post => post.type === 'poll'),
      announcement: posts.filter(post => post.type === 'announcement'),
      marketplace: posts.filter(post => post.type === 'marketplace'),
      event: posts.filter(post => post.type === 'event'),
      survey: posts.filter(post => post.type === 'survey')
    };

    // Count comments for each post (optional)
    if (req.query.includeCommentCount === 'true') {
      for (const post of posts) {
        post.commentCount = await Comment.countDocuments({ postId: post._id });
      }
    }

    // Format the response
    const response = {
      user: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar
      },
      posts: categorizedPosts,
      counts: {
        total: posts.length,
        regular: categorizedPosts.regular.length,
        poll: categorizedPosts.poll.length,
        announcement: categorizedPosts.announcement.length,
        marketplace: categorizedPosts.marketplace.length,
        event: categorizedPosts.event.length,
        survey: categorizedPosts.survey.length
      }
    };

    res.status(200).json(new ApiResponse(200, response, "User posts fetched successfully"));

  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to fetch user posts", error.statusCode || 500));
  }
});