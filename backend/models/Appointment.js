import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userEmail: { type: String, required: true, index: true },
  phone: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  department: { type: String, required: true },
  doctor: { type: String, required: true },
  message: { type: String },
}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);
