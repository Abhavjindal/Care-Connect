import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import Reminder from "../models/Reminder.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretcareconnectkey123!";

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = email === "admin@careconnect.com" ? "admin" : "patient";

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Signup successful!",
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        age: newUser.age,
        emergencyContact: newUser.emergencyContact
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide both email and password" });
    }

    let user = await User.findOne({ email });

    if (!user && email === "admin@careconnect.com" && password === "admin123") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = new User({
        name: "Administrator",
        email: "admin@careconnect.com",
        password: hashedPassword,
        role: "admin"
      });
      await user.save();
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful!",
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        emergencyContact: user.emergencyContact
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Profile update route to save age and emergency contact
router.put("/profile", async (req, res) => {
  try {
    const { email, age, emergencyContact } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (age !== undefined) user.age = Number(age);
    if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
    await user.save();

    res.json({
      message: "Profile updated successfully!",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        age: user.age,
        emergencyContact: user.emergencyContact
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error during profile update" });
  }
});

// Get all users (excluding passwords and the admin themselves)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ email: { $ne: "admin@careconnect.com" } }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error while fetching users" });
  }
});

// Delete user (cascades and deletes appointments and reminders)
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cascade deletes
    await Appointment.deleteMany({ userEmail: user.email });
    await Reminder.deleteMany({ userEmail: user.email });

    // Delete user
    await User.findByIdAndDelete(id);

    res.json({ message: "User and all associated data deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error during user deletion" });
  }
});

export default router;
