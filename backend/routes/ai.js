// backend/routes/ai.js
import express from "express";
const router = express.Router();

router.post("/chat", (req, res) => {
  res.json({ reply: "AI chat endpoint working!" });
});

export default router;
