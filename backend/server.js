import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Models & Routes
import authRoutes from "./routes/auth.js";
import doctorsRoutes from "./routes/doctors.js";
import appointmentsRoutes from "./routes/appointments.js";
import reminderRoutes from "./routes/reminders.js";
import Doctor from "./models/Doctor.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/reminders", reminderRoutes);

// ✅ Simple route to test connection
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend connected successfully!" });
});

// CSV Line Parser (handles quotes correctly)
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Seed Doctors from CSV if empty
const seedDoctors = async () => {
  try {
    const count = await Doctor.countDocuments({});
    if (count > 0) {
      console.log("ℹ️ Doctors collection already seeded in MongoDB.");
      return;
    }

    const csvPath = path.join(__dirname, "../frontend/public/assets/data/doctors.csv");
    if (!fs.existsSync(csvPath)) {
      console.warn("⚠️ doctors.csv not found at path:", csvPath);
      return;
    }

    const data = fs.readFileSync(csvPath, "utf-8");
    const lines = data.split(/\r?\n/);
    const doctors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = parseCSVLine(line);
      if (parts.length < 2 || !parts[0]) continue;

      doctors.push({
        Name: parts[0],
        Field: parts[1] || "",
        "Contact Number": parts[2] || "",
        Information: parts[3] || "",
        Experience: parts[4] || "",
      });
    }

    if (doctors.length > 0) {
      await Doctor.insertMany(doctors);
      console.log(`✅ Successfully seeded ${doctors.length} doctors from CSV to MongoDB.`);

      // Seed Doctor User Accounts
      const salt = await bcrypt.genSalt(10);
      const hashedDoctorPassword = await bcrypt.hash("doctor123", salt);
      
      const doctorUsers = doctors.map(doc => {
        const cleanName = doc.Name.replace(/Dr\.\s*/i, '').toLowerCase().trim();
        const email = cleanName.replace(/[^a-z0-9]/g, '.') + "@careconnect.com";
        // Clean up multiple dots if any
        const finalEmail = email.replace(/\.+/g, '.');
        return {
          name: doc.Name,
          email: finalEmail,
          password: hashedDoctorPassword,
          role: "doctor",
          doctorName: doc.Name
        };
      });
      
      let seededUsers = 0;
      for (const du of doctorUsers) {
        const exists = await User.findOne({ email: du.email });
        if (!exists) {
          await User.create(du);
          seededUsers++;
        }
      }
      console.log(`✅ Successfully seeded ${seededUsers} Doctor User accounts.`);
    }
  } catch (error) {
    console.error("❌ Error seeding doctors:", error);
  }
};

// Seed default Admin if empty
const seedAdmin = async () => {
  try {
    const adminEmail = "admin@careconnect.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("ℹ️ Admin account already seeded in MongoDB.");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    const adminUser = new User({
      name: "Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      age: 45,
      emergencyContact: "+1 (800) 555-0199"
    });

    await adminUser.save();
    console.log("✅ Successfully seeded Admin account (admin@careconnect.com) in MongoDB.");
  } catch (error) {
    console.error("❌ Error seeding Admin account:", error);
  }
};

// Database Connection & Server Startup
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/careconnect";

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected successfully!");
    await seedDoctors();
    await seedAdmin();
    app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    // Start server even if MongoDB connection fails so app doesn't crash entirely
    app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT} (Database Offline)`));
  });
