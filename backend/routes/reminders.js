import express from "express";
import Reminder from "../models/Reminder.js";

const router = express.Router();

// Get all reminders for a user
router.get("/", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    const reminders = await Reminder.find({ userEmail: email }).sort({ createdAt: -1 });
    res.json(reminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({ message: "Server error while retrieving reminders" });
  }
});

// Add a reminder
router.post("/", async (req, res) => {
  const { userEmail, medicineName, time } = req.body;
  if (!userEmail || !medicineName || !time) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const newReminder = new Reminder({ userEmail, medicineName, time });
    await newReminder.save();
    res.status(201).json({ message: "Reminder added successfully", reminder: newReminder });
  } catch (error) {
    console.error("Error creating reminder:", error);
    res.status(500).json({ message: "Server error while adding reminder" });
  }
});

// Delete a reminder
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const reminder = await Reminder.findByIdAndDelete(id);
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    res.status(500).json({ message: "Server error while deleting reminder" });
  }
});

export default router;
