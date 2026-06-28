const express = require("express");
const router = express.Router();

const { authentication } = require("../middleware/auth");
const { getAllTasks,completeTask,getDashboardStats} = require("../controllers/taskController");

// ==========================
// Task Routes
// ==========================

// Get all tasks of logged-in user
router.get("/dashboard", authentication, getDashboardStats);
router.get("/", authentication, getAllTasks);
router.patch("/:taskId/complete", authentication, completeTask);

module.exports = router;