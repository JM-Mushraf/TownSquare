import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { upload } from "../middlewares/multer.js";
import  { registerUser , verifyUser,loginUser,logoutUser,getUserDetails, deleteUser,updateAccountDetails,verifyAccountChanges,updateUserAvatar,resendVerificationOTP,addBookmarks,removeBookmark, getBookmarks}  from "../controllers/userController.js";
import { getCommunities, listUserChats } from "../controllers/chatController.js";
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

userRouter.put("/update", isAuthenticated,updateAccountDetails);
userRouter.post("/verify-email", isAuthenticated,verifyAccountChanges);
userRouter.patch("/avatar",isAuthenticated,upload.single("avatar"),updateUserAvatar);
userRouter.post("/resend-verification", isAuthenticated, resendVerificationOTP);
userRouter.post('/bookmark',isAuthenticated,addBookmarks)
userRouter.delete('/bookmark-del', isAuthenticated, removeBookmark);
userRouter.get('/getbookmarks',isAuthenticated,getBookmarks)
userRouter.get('/chat/getCommunities',isAuthenticated,getCommunities)
