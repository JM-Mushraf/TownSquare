import { User } from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js"; // Ensure this is imported
import jwt from "jsonwebtoken"; // Ensure this is imported
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'cnmsjkenfkljnsjklgnsdljkfjsdkcnmsa4rw4jljsdfl';

export const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return next(
        new ErrorHandler("You need to Login to Access this Resource", 401)
      );
    }

    const decodedData = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
  } catch (error) {
    console.log("Error in isAuthenticated:", error); // Debug: Log the error
    return next(new ErrorHandler(error.message, error.statusCode));
  }
};