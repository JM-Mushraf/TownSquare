import { EmergencyService } from "../models/emergencyModel.js"; 

// Create Emergency Service
export const createEmergencyService = async (req, res) => {
  try {
    const { title, location, contact } = req.body;

    if (!title || !location || !contact) {
      return res.status(400).json({ message: "Title, location, and contact number are required." });
    }

    const newEmergencyService = new EmergencyService({
      title,
      location,
      contact,
    });

    await newEmergencyService.save();
    res.status(201).json({ success: true, message: "Emergency service added successfully", data: newEmergencyService });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding emergency service", error: error.message });
  }
};

// Get All Emergency Services
export const getAllEmergencyServices = async (req, res) => {
  try {
    const services = await EmergencyService.find();
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching emergency services", error: error.message });
  }
};

// Get Emergency Service by ID
export const getEmergencyServiceById = async (req, res) => {
  try {
    const service = await EmergencyService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Emergency service not found" });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching emergency service", error: error.message });
  }
};