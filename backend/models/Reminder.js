import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  medicineName: { type: String, required: true },
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Reminder", reminderSchema);
