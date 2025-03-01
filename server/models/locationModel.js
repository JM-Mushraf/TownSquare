import mongoose, { mongo } from "mongoose";

export const locationSchema=new mongoose.Schema({
    county:[],
    postcode:[],
    city:[]
})

export const Location=new mongoose.model('Location',locationSchema)