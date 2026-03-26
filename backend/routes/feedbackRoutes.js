const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// Add feedback
router.post("/add", async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();
    res.json({ message: "Feedback submitted", feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get feedbacks
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate("serviceId");
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
