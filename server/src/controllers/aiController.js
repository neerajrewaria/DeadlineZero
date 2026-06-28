const Task = require("../models/Task");
const User = require("../models/User");

const {
  generateTaskFromPrompt, generateDailyPlan} = require("../services/geminiService");

// ==============================
// Create Tasks using Gemini AI
// ==============================
exports.createTaskWithAI = async (req, res) => {
  try {
    // Get prompt from frontend
    const { prompt } = req.body;

    // Check if prompt is provided
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required.",
      });
    }

    // Logged in user
    const userId = req.user.id;

    // Generate tasks using Gemini
    const aiResponse = await generateTaskFromPrompt(prompt);

    // Array to store saved tasks
    const savedTasks = [];

    // Save every generated task
    for (const task of aiResponse.tasks) {
      const newTask = await Task.create({
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        priority: task.priority,
        estimatedHours: task.estimatedHours,
        category: task.category,

        aiSummary: task.aiSummary,
        aiReasoning: task.aiReasoning,
        aiSuggestions: task.aiSuggestions,

        user: userId,
      });

      savedTasks.push(newTask);
    }

    // Return response
    return res.status(201).json({
      success: true,
      message: "Tasks created successfully.",
      totalTasks: savedTasks.length,
      tasks: savedTasks,
    });

  } catch (error) {
    console.error("AI Task Creation Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create AI tasks.",
      error: error.message,
    });
  }
};

// ==========================================
// Generate AI Daily Planner
// ==========================================
exports.getDailyPlan = async (req, res) => {
  try {
    // Logged-in user
    const userId = req.user.id;

    // Fetch user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Fetch pending tasks only
    const tasks = await Task.find({
      user: userId,
      status: "pending",
    }).sort({
      deadline: 1,
    });

    // No pending tasks
    if (tasks.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No pending tasks found.",
        plan: [],
      });
    }

    // Generate AI Daily Plan
    const dailyPlan = await generateDailyPlan(tasks, user);

    // Return response
    return res.status(200).json({
      success: true,
      message: "Daily plan generated successfully.",
      dailyPlan,
    });

  } catch (error) {
    console.error("Daily Planner Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate daily plan.",
      error: error.message,
    });
  }
};