import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { createEmergencyService,getAllEmergencyServices, getEmergencyServiceById} from "../controllers/emergencyController.js";
export const emergencyRouter=express.Router();

emergencyRouter.post("/create-emergency-services",createEmergencyService);
emergencyRouter.get("/get-all-emergency-services",getAllEmergencyServices);
emergencyRouter.get("/get-emergency-services/:id",getEmergencyServiceById);