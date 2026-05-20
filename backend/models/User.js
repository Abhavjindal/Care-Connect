import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "admin"], default: "patient" },
  age: { type: Number },
  emergencyContact: { type: String },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
