const express = require("express");
const router = express.Router();

const { authentication } = require("../middleware/auth");
const {
    createTask,
    deleteTask,
    getAllTasks,
    completeTask,
    getDashboardStats,
    getStoredDailyPlan,
    markTaskPending,
    updateTask,
} = require("../controllers/taskController");
const {getAnalytics} = require("../controllers/analyticsController");

// ==========================
// Task Routes
// ==========================

// Get all tasks of logged-in user
router.get("/dashboard", authentication, getDashboardStats);
router.get("/daily-plan", authentication, getStoredDailyPlan);
router.get("/analytics",authentication, getAnalytics);
router.get("/", authentication, getAllTasks);
router.post("/", authentication, createTask);
router.patch("/:taskId/complete", authentication, completeTask);
router.patch("/:taskId/pending", authentication, markTaskPending);
router.patch("/:taskId", authentication, updateTask);
router.delete("/:taskId", authentication, deleteTask);

module.exports = router;
