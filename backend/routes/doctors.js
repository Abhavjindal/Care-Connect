import express from "express";
import Doctor from "../models/Doctor.js";

const router = express.Router();

// Get all doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Server error while retrieving doctors list" });
  }
});

// AI Doctor chat assistant
router.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    const systemPrompt = `You are a friendly AI doctor/nurse assistant on the CareConnect telehealth platform. The patient says: "${message}". Provide a concise, highly empathetic, and medically informed response in simple English. Keep it to 2-3 sentences. Don't diagnose diseases; give general wellness advice, ask friendly clarifying questions, and advise them to consult a CareConnect doctor if necessary.`;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyC_WRtStwMRHd1LhzsmsK0Fybi8iGZfMqY", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }]
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("Gemini API Error:", errData);
      return res.status(response.status).json({ message: "Error communicating with AI Service" });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I'm unable to process your request right now.";
    
    res.json({ reply: replyText });
  } catch (error) {
    console.error("Error in AI Doctor chat routing:", error);
    res.status(500).json({ message: "Server error during chat assistance" });
  }
});

export default router;
