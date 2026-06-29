const express = require("express");
const router = express.Router();

const { createTaskWithAI, getDailyPlan, regenerateDailyPlan } = require("../controllers/aiController");
const { authentication } = require("../middleware/auth");

// Protected Route
router.post("/create-task", authentication, createTaskWithAI);

// Generate (and return) daily plan and store it as today’s plan
router.get("/daily-plan", authentication, getDailyPlan);

// Force regeneration: always refetch latest pending tasks and overwrite today’s stored plan
router.post("/daily-plan/regenerate", authentication, regenerateDailyPlan);


module.exports = router;

