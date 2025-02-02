import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";
import  { registerUser , loginUser,logoutUser}  from "../controllers/userController.js";
export const userRouter = express.Router();

userRouter.post(
  "/register",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  registerUser
);
userRouter.post("/login",loginUser)
userRouter.get("/logout",logoutUser)