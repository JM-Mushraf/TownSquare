import { User } from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export const isAuthenticated = async (req, res, next) => {
  try {
    // 1. More robust cookie extraction
    const token = req.cookies?.token || 
                 req.headers?.authorization?.replace("Bearer ", "") || 
                 req.body?.token;
    
    if (!token) {
      console.log('No token found in:', {
        cookies: req.cookies,
        headers: req.headers,
        body: req.body
      });
      return next(new ErrorHandler("Authentication required", 401));
    }

    // 2. Verify token
    const decodedData = jwt.verify(token, JWT_SECRET);
    
    // 3. Find user and attach to request
    const user = await User.findById(decodedData.id);
    
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return next(new ErrorHandler("Invalid token", 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ErrorHandler("Token expired", 401));
    }
    
    // Generic error handling
    return next(new ErrorHandler("Authentication failed", 401));
  }
};