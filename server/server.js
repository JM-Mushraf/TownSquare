import { app } from "./app.js";
import dotenv from 'dotenv'
import { connection } from "./database/connection.js";
import e from "express";
connection().then(()=>{
    console.log('DATABASE CONNECTION ESTABLISHED');
    
}).catch((e)=>{
    console.log(e);
    
})
dotenv.config();
const PORT=process.env.PORT


app.listen(3000,()=>{
    console.log("SERVER IS RUNNING ON PORT ",PORT);
})