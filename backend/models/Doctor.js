import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  Name: { type: String, required: true },
  Field: { type: String, required: true },
  "Contact Number": { type: String },
  Information: { type: String },
  Experience: { type: String },
}, { timestamps: true });

export default mongoose.model("Doctor", doctorSchema);
