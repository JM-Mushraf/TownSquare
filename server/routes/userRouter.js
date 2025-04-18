import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";
import  { registerUser , verifyUser,loginUser,logoutUser,getUserDetails, deleteUser, addBookmarks, getBookmarks}  from "../controllers/userController.js";
import { listUserChats } from "../controllers/chatController.js";
export const userRouter = express.Router();

userRouter.post(
  "/register",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  registerUser
);
userRouter.post("/register/verification",verifyUser)
userRouter.post("/login",loginUser)
userRouter.get("/logout",logoutUser)
userRouter.get("/getUserDetails",isAuthenticated,getUserDetails)
userRouter.get('/chats',isAuthenticated,listUserChats)
userRouter.delete('/delete',isAuthenticated,deleteUser)
userRouter.post('/bookmark',isAuthenticated,addBookmarks)
userRouter.get('/getbookmarks',isAuthenticated,getBookmarks)