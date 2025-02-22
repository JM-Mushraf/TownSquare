import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter your username"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      select: false,
    },
    role: {
      type: String,
      enum: ["resident", "official", "admin", "emergency"],
      default: "resident",
    },
    avatar: {
      type: String,
      required: true,
    },
    avatarPublicId: {
      type: String,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
      county: { type: String, required: true },
      postcode: { type: String, required: true },
    },

    bio: {
      type: String,
      maxlength: 500,
    },
    communitiesJoined: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community",
      },
    ],
    verificationCode: {
      type: Number,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.getJWT = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: "5d",
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
