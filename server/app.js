import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { postRouter } from "./routes/postRouter.js";
import { userRouter } from "./routes/userRouter.js";
import { emergencyRouter } from "./routes/emergencyRouter.js";
import { error } from "./middlewares/error.js";
import session from 'express-session';
import { MessageRouter } from "./routes/messageRouter.js";

export const app = express();
// app.use(Error)
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // allow requests from your frontend
    credentials: true, // if you're using cookies or HTTP authentication
  })
);
app.use(session({
  secret: 'Mushraf123',  // Using your custom secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to true if using HTTPS in production
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/user", userRouter);
app.use('/post',postRouter);
app.use("/emergency",emergencyRouter);
app.use('/message',MessageRouter)
app.use(error);