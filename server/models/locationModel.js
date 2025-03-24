import mongoose from "mongoose";

export const locationSchema = new mongoose.Schema({
    county: String,
    postcode: String,
    city: String,
});

export const Location = mongoose.model("Location", locationSchema);