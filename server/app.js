import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';


export const app=express()




app.use(express.json())
app.use(cookieParser())
app.use(express.static("public"))
app.get("/",(req,res)=>{
    res.send("Hello World")
})