import { AsyncHandler } from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/userModel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendToken } from "../middlewares/jwtToken.js";
import { ApiResponse } from "../routes/apiResponse.js";
export const registerUser = AsyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new ErrorHandler("All fields are required", 400);
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ErrorHandler("Username or email already exists", 409);
  }

  const avatarFile = req.files?.avatar?.[0]; // Check if avatar is provided
  if (!avatarFile) {
    throw new ErrorHandler("Avatar file is required", 400);
  }

  const uploadedAvatar = await uploadOnCloudinary(avatarFile.path);
  if (!uploadedAvatar) {
    throw new ErrorHandler("Error uploading avatar file", 500);
  }

  // Ensure only the URL is stored in the `avatar` field
  const newUser = await User.create({
    username,
    email,
    password,
    avatar: uploadedAvatar.url, // Store only the URL as a string
    avatarPublicId: uploadedAvatar.public_id, // Store public ID separately
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: newUser,
  });
});

export const loginUser = AsyncHandler(async (req, res, next) => {
  try {
    const { email, password } =await req.body;
    if (!email || !password) {
      return next(new ErrorHandler("Please enter email and password", 400));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }
    //if email and password matched send token
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