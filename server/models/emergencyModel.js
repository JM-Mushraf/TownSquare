import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      enum: ["police", "hospital", "fire_station", "market", "pharmacy", "gas_station", "electricity_issue"],
    },
    location: {
    type: String, required: true 
    },
    contact: {
    type: String, required: true 
    },
  },
  { timestamps: true }
);
export const EmergencyService = mongoose.model("EmergencyService", emergencySchema);