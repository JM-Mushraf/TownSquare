import { AsyncHandler } from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/userModel.js";
import { uploadOnCloudinary,deleteFromCloudinary } from "../utils/cloudinary.js";
import { sendToken } from "../middlewares/jwtToken.js";
import { ApiResponse } from "../routes/apiResponse.js";
import { sendMail } from "../nodemailer/nodemailer.js";
import { Location } from "../models/locationModel.js";
import { createChat } from "./chatController.js";

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
  const newUser = await User.create({
    username,
    email,
    password,
    role,
    phone,
    location,
    avatar: avatar.url,
    avatarPublicId: avatar.publicId,
  });

  req.session.verificationData = null;

  let newLocation = await Location.findOne({
    $or: [
        { county: location.county },
        { postcode: location.postcode },
        { city: location.city }
    ]
});

if (!newLocation) {
  // No existing location, create a new entry
  newLocation = await Location.findOneAndUpdate(
      {}, 
      { 
          $push: { county: location.county, postcode: location.postcode, city: location.city } 
      }, 
      { new: true, upsert: true }
  );

  // Call createChat for the new location
  await createChat(req, res);
}

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