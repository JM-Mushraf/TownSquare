import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { userRouter } from "./routes/userRouter.js";
import { error } from "./middlewares/error.js";

export const app = express();
// app.use(Error)
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // allow requests from your frontend
    credentials: true, // if you're using cookies or HTTP authentication
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/user", userRouter);



app.use(error);