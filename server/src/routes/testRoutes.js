// routes/testRoutes.js
const express = require("express");
const router = express.Router();
console.log("✅ Test Routes Loaded");
const Task = require("../models/Task");
const User = require("../models/User");

const {generateTaskFromPrompt,generateDailyPlan} = require("../services/geminiService");

router.post("/gemini", async (req, res) => {
  try {
    const { prompt } = req.body;

    const result = await generateTaskFromPrompt(prompt);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});





router.get("/daily-plan", async (req, res) => {
  try {

    // Replace with your own user id
    const userId = "6a3f877b2ca346587257eeb5";

    // Fetch user
    const user = await User.findById(userId);

    // Fetch pending tasks
    const tasks = await Task.find({
      user: userId,
      status: "pending",
    });

    // Generate AI plan
    const plan = await generateDailyPlan(tasks, user);

    return res.json(plan);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;