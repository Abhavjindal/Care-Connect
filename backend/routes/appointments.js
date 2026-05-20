import express from "express";
import Appointment from "../models/Appointment.js";

const router = express.Router();

// Book an appointment
router.post("/", async (req, res) => {
  try {
    const { userName, userEmail, phone, date, time, department, doctor, message } = req.body;

    if (!userName || !userEmail || !phone || !date || !time || !department || !doctor) {
      return res.status(400).json({ message: "Missing required appointment fields" });
    }

    const newAppointment = new Appointment({
      userName,
      userEmail,
      phone,
      date,
      time,
      department,
      doctor,
      message,
    });

    await newAppointment.save();
    res.status(201).json({ message: "Appointment booked successfully!", appointment: newAppointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Server error while booking appointment" });
  }
});

// Get appointments (filtered by user email, or returning all if email is admin)
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email parameter is required" });
    }

    let appointments;
    if (email === "admin@careconnect.com") {
      appointments = await Appointment.find({}).sort({ createdAt: -1 });
    } else {
      appointments = await Appointment.find({ userEmail: email }).sort({ createdAt: -1 });
    }

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error while retrieving appointments" });
  }
});

// Update an appointment
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, date, time, message } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (phone) appointment.phone = phone;
    if (date) appointment.date = date;
    if (time) appointment.time = time;
    if (message !== undefined) appointment.message = message;

    await appointment.save();
    res.json({ message: "Appointment updated successfully", appointment });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Server error while updating appointment" });
  }
});

// Cancel (Delete) an appointment
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Server error while cancelling appointment" });
  }
});

export default router;
