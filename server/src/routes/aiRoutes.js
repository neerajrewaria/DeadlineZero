const express = require("express");
const router = express.Router();


const { createTaskWithAI,getDailyPlan} = require("../controllers/aiController");
const { authentication } = require("../middleware/auth");

// Protected Route
router.post("/create-task", authentication, createTaskWithAI);

router.get("/daily-plan", authentication, getDailyPlan);
module.exports = router;