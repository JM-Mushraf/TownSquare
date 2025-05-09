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
import jwt from "jsonwebtoken";
import { sendMessage } from "../nodemailer/mailMessage.js";
import dotenv from "dotenv";
dotenv.config();
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

//update user account details
export const updateAccountDetails = AsyncHandler(async (req, res) => {
  const { email, username, oldPassword, newPassword, phone, bio } = req.body;

  // Check if at least one field is being updated
  if (!email && !username && !oldPassword && !newPassword && !bio && !phone) {
    throw new ErrorHandler("At least one field must be provided for update", 400);
  }

  // Find user with all necessary fields
  const user = await User.findById(req.user._id)
    .select("+password +verificationCode +emailUpdateToken +emailUpdateTokenExpires");
    
  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  let verificationRequired = false;

  // Process email update if email is present AND different
  if (email && email !== user.email) {
    // Check if email already exists
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      throw new ErrorHandler("Email already in use", 400);
    }

    // Send verification code to the NEW email address
    let verificationCode;
    try {
      verificationCode = await sendMail(email); // This now returns the generated code
    } catch (error) {
      throw new ErrorHandler("Failed to send verification email", 500);
    }

    const expiresAt = new Date(Date.now() + 30 * 1000); // 30 seconds from now

    // Generate verification token (includes the verification code)
    const emailUpdateToken = jwt.sign(
      { 
        userId: user._id, 
        newEmail: email, 
        purpose: 'email-update',
        verificationCode: verificationCode.toString()
      },
      process.env.JWT_SECRET,
      { expiresIn: '30s' } // Token expires in 30 seconds
    );

    // Update user fields
    user.verificationCode = verificationCode.toString();
    user.emailUpdateToken = emailUpdateToken;
    user.emailUpdateTokenExpires = expiresAt;
    verificationRequired = true;

    // Save immediately to ensure tokens are stored
    await user.save({ validateBeforeSave: false });
  }

  // Handle password update
  if (oldPassword || newPassword) {
    if (!oldPassword || !newPassword) {
      throw new ErrorHandler("Both current and new passwords are required", 400);
    }
    
    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
      throw new ErrorHandler("Invalid current password", 401);
    }
    
    user.password = newPassword;
    // Send password change notification
    await sendMessage(user.email, "Your password was changed successfully");
  }

  // Update other fields
  if (username) user.username = username;
  if (bio) user.bio = bio;
  if (phone) user.phone = phone;

  // Final save with validation
  await user.save({ validateBeforeSave: true });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          _id: user._id,
          username: user.username,
          email: user.email, // Returns old email until verified
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          bio: user.bio
        },
        verificationRequired,
        expiresAt: verificationRequired ? user.emailUpdateTokenExpires : undefined
      },
      verificationRequired 
        ? "Verification code sent to new email address" 
        : "Profile updated successfully"
    )
  );
});
export const verifyAccountChanges = AsyncHandler(async (req, res) => {
  const { verificationCode } = req.body;

  if (!verificationCode) {
    throw new ErrorHandler("Verification code is required", 400);
  }

  // Find user with all verification fields
  const user = await User.findById(req.user._id)
    .select("+verificationCode +emailUpdateToken +emailUpdateTokenExpires");
    
  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  // Check if verification data exists
  if (!user.verificationCode || !user.emailUpdateToken) {
    // Clean up any partial data if exists
    if (user.verificationCode || user.emailUpdateToken) {
      user.verificationCode = undefined;
      user.emailUpdateToken = undefined;
      user.emailUpdateTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }
    throw new ErrorHandler("No pending email update request. Please initiate email change again.", 400);
  }

  // Check if OTP has expired
  if (user.emailUpdateTokenExpires && user.emailUpdateTokenExpires < new Date()) {
    // Clean up expired data
    user.verificationCode = undefined;
    user.emailUpdateToken = undefined;
    user.emailUpdateTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    throw new ErrorHandler("Verification code has expired. Please request a new one.", 400);
  }

  // Verify code matches (convert both to strings for comparison)
  if (verificationCode.toString() !== user.verificationCode.toString()) {
    throw new ErrorHandler("Invalid verification code", 400);
  }

  try {
    // Verify the token
    const decoded = jwt.verify(user.emailUpdateToken, process.env.JWT_SECRET);
    
    // Validate token contents
    if (decoded.purpose !== 'email-update') {
      throw new ErrorHandler("Invalid token purpose", 400);
    }
    
    if (decoded.userId.toString() !== user._id.toString()) {
      throw new ErrorHandler("Token doesn't match user", 400);
    }

    // Verify email availability again
    const emailExists = await User.findOne({ email: decoded.newEmail });
    if (emailExists && emailExists._id.toString() !== user._id.toString()) {
      throw new ErrorHandler("Email is now in use by another account", 400);
    }

    // Store old email for notification
    const oldEmail = user.email;
    
    // Update user data
    user.email = decoded.newEmail;
    user.emailVerified = true;
    user.verificationCode = undefined;
    user.emailUpdateToken = undefined;
    user.emailUpdateTokenExpires = undefined;
    
    await user.save({ validateBeforeSave: true });

    // Send notifications
    await Promise.all([
      sendMessage(oldEmail, `Your account email has been changed to ${decoded.newEmail}`),
      sendMessage(decoded.newEmail, "Your email has been successfully verified")
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        { 
          email: user.email,
          emailVerified: true 
        },
        "Email updated successfully"
      )
    );

  } catch (err) {
    // Handle specific JWT errors
    if (err.name === 'TokenExpiredError') {
      // Clean up expired tokens
      user.verificationCode = undefined;
      user.emailUpdateToken = undefined;
      user.emailUpdateTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      throw new ErrorHandler("Verification token expired. Please request a new verification email.", 400);
    }
    
    if (err.name === 'JsonWebTokenError') {
      throw new ErrorHandler("Invalid verification token", 400);
    }
    
    // Handle other errors
    throw new ErrorHandler(err.message || "Verification failed", 400);
  }
});
export const resendVerificationOTP = AsyncHandler(async (req, res) => {
  // Find user with verification fields
  const user = await User.findById(req.user._id)
    .select('+verificationCode +emailUpdateToken +emailUpdateTokenExpires');
  
  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  // Check if there's any verification data
  if (!user.emailUpdateToken || !user.verificationCode) {
    throw new ErrorHandler("No pending email update request", 400);
  }

  try {
    // Decode the token to get the new email (don't verify as it might be expired)
    const decoded = jwt.decode(user.emailUpdateToken);
    
    if (!decoded || !decoded.newEmail) {
      throw new ErrorHandler("Invalid verification data", 400);
    }

    // Generate and send new verification code
    const newVerificationCode = await sendMail(decoded.newEmail);

    const expiresAt = new Date(Date.now() + 30 * 1000); // New OTP expires in 30 seconds
    
    // Generate new token with the new verification code
    const newEmailUpdateToken = jwt.sign(
      {
        userId: user._id,
        newEmail: decoded.newEmail,
        purpose: 'email-update',
        verificationCode: newVerificationCode.toString()
      },
      process.env.JWT_SECRET,
      { expiresIn: '30s' } // New token expires in 30 seconds
    );
    
    // Update user fields
    user.verificationCode = newVerificationCode.toString();
    user.emailUpdateToken = newEmailUpdateToken;
    user.emailUpdateTokenExpires = expiresAt;
    
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
      new ApiResponse(
        200,
        { 
          email: decoded.newEmail,
          expiresAt: user.emailUpdateTokenExpires
        },
        "New verification code sent successfully"
      )
    );

  } catch (err) {
    // Clean up verification data if something went wrong
    user.verificationCode = undefined;
    user.emailUpdateToken = undefined;
    user.emailUpdateTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Handle specific errors
    if (err.message.includes("Failed to send verification email")) {
      throw new ErrorHandler("Failed to resend verification email", 500);
    }
    
    // Handle other errors
    throw new ErrorHandler(err.message || "Failed to resend verification code", 400);
  }
});
export const updateUserAvatar = AsyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ErrorHandler("Avatar file is missing", 400);
  }

  // Upload new avatar to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar?.url || !avatar?.public_id) {
    throw new ErrorHandler("Error while uploading avatar", 400);
  }

  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ErrorHandler("User not found", 404);
  }

  // Delete old avatar if it exists
  if (user.avatarPublicId) {
    await deleteFromCloudinary(user.avatarPublicId).catch(error => {
      console.error("Error deleting old avatar:", error);
    });
  }

  // Update user's avatar
  user.avatar = avatar.url;
  user.avatarPublicId = avatar.public_id;

  await user.save({ validateBeforeSave: true });

  res.status(200).json(
    new ApiResponse(
      200, 
      { avatar: avatar.url }, 
      "Avatar updated successfully"
    )
  );
});

export const addBookmarks = AsyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const { postId } = req.body;

  if (!userId) {
    throw new ErrorHandler("Unauthorized: User ID not found", 401);
  }

  if (!postId) {
    throw new ErrorHandler("Post ID is required", 400);
  }

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      throw new ErrorHandler("Post not found", 404);
    }

    // Check if post is already bookmarked
    if (user.bookmarks.includes(postId)) {
      throw new ErrorHandler("Post is already bookmarked", 400);
    }

    // Add post to bookmarks
    user.bookmarks.push(postId);
    await user.save();

    res.status(200).json(new ApiResponse(200, { bookmarks: user.bookmarks }, "Post bookmarked successfully"));

  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to bookmark post", error.statusCode || 500));
  }
});
export const removeBookmark = AsyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  const { postId } = req.body;

  if (!userId) {
    throw new ErrorHandler("Unauthorized: User ID not found", 401);
  }

  if (!postId) {
    throw new ErrorHandler("Post ID is required", 400);
  }

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    // Check if post exists (optional - depends on your requirements)
    const post = await Post.findById(postId);
    if (!post) {
      throw new ErrorHandler("Post not found", 404);
    }

    // Check if post is actually bookmarked
    const bookmarkIndex = user.bookmarks.indexOf(postId);
    if (bookmarkIndex === -1) {
      throw new ErrorHandler("Post is not in bookmarks", 400);
    }

    // Remove post from bookmarks
    user.bookmarks.splice(bookmarkIndex, 1);
    await user.save();

    res.status(200).json(
      new ApiResponse(
        200, 
        { bookmarks: user.bookmarks }, 
        "Post removed from bookmarks successfully"
      )
    );

  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to remove bookmark", error.statusCode || 500));
  }
});
export const getBookmarks = AsyncHandler(async (req, res, next) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ErrorHandler("Unauthorized: User ID not found", 401);
  }

  try {
    // Get user with bookmarks populated
    const user = await User.findById(userId).populate({
      path: 'bookmarks',
      populate: {
        path: 'createdBy',
        select: 'username avatar email'
      }
    });

    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    // Format the bookmarked posts
    const formattedBookmarks = user.bookmarks.map(post => ({
      _id: post._id,
      title: post.title,
      description: post.description,
      type: post.type,
      createdAt: post.createdAt,
      upVotes: post.upVotes,
      downVotes: post.downVotes,
      createdBy: {
        _id: post.createdBy._id,
        username: post.createdBy.username,
        avatar: post.createdBy.avatar
      },
      // Include additional fields based on post type
      ...(post.type === 'poll' && {
        poll: {
          question: post.poll?.question,
          options: post.poll?.options,
          deadline: post.poll?.deadline,
          status: post.poll?.status
        }
      }),
      ...(post.type === 'marketplace' && {
        marketplace: {
          itemType: post.marketplace?.itemType,
          price: post.marketplace?.price,
          location: post.marketplace?.location,
          status: post.marketplace?.status
        }
      }),
      // Add other post type specific fields as needed
      attachments: post.attachments,
      important: post.important
    }));

    res.status(200).json(
      new ApiResponse(
        200,
        {
          bookmarks: formattedBookmarks,
          count: formattedBookmarks.length
        },
        "Bookmarked posts fetched successfully"
      )
    );

  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to fetch bookmarks", error.statusCode || 500));
  }
});


export const getUserActivityStats = AsyncHandler(async (req, res, next) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "Unauthorized: User ID not found");
  }

  // Get user details (excluding sensitive information)
  const user = await User.findById(userId).select("-password -verificationCode");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Get post count for the user
  const postCount = await Post.countDocuments({ createdBy: userId });

  // Get comment count for the user
  const commentCount = await Comment.countDocuments({ userId: userId });

  // Create response object
  const response = {
    userDetails: user,
    activityStats: {
      postCount,
      commentCount
    }
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "User activity stats fetched successfully"));
});