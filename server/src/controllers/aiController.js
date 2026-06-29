const Task = require("../models/Task");
const User = require("../models/User");

const {
  generateTaskFromPrompt,
  generateDailyPlan,
} = require("../services/geminiService");
const { markUserPlanOutdated, saveTodayPlan, getDateKey } = require("../utils/dailyPlan");

const {
  createNotification,
  createPlannerNotification,
  createTaskNotification,
  dismissNotifications,
} = require("../services/notificationService");

// ==============================
// Create Tasks using Gemini AI
// ==============================
exports.createTaskWithAI = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required.",
      });
    }

    const userId = req.user.id;

    // ── FIX: fetch the user's timezone so buildDeadline() in geminiService
    // can convert wall-clock times (e.g. "8:40 PM") to the correct UTC instant.
    // Previously, generateTaskFromPrompt received no timezone and the deadline
    // was stored as UTC midnight because new Date("YYYY-MM-DD") is always UTC.
    const user = await User.findById(userId).select("timezone").lean();
    const timeZone = user?.timezone || "Asia/Kolkata";

    // Pass the timezone into the AI service so it can:
    //   1. Give Gemini the current local time (for "in 3 hours" etc.)
    //   2. Run buildDeadline() with the correct offset after parsing.
    const aiResponse = await generateTaskFromPrompt(prompt, timeZone);

    const savedTasks = [];

    for (const task of aiResponse.tasks) {
      const newTask = await Task.create({
        title: task.title,
        description: task.description,
        deadline: task.deadline,   // now a proper UTC Date, not a bare date string
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

    await markUserPlanOutdated(userId);
    for (const task of savedTasks) {
      await createTaskNotification(userId, task, "added");
    }
    await createPlannerNotification(userId, "outdated", {
      source: "ai-task-generation",
      taskCount: savedTasks.length,
    });
    await dismissNotifications({
      user: userId,
      type: "ai",
      "metadata.eventType": "ai-task-failed",
    });

    return res.status(201).json({
      success: true,
      message: "Tasks created successfully.",
      totalTasks: savedTasks.length,
      tasks: savedTasks,
    });

  } catch (error) {
    console.error("AI Task Creation Error:", error);
    if (req.user?.id) {
      await createNotification({
        user: req.user.id,
        title: "AI Task Generation Failed",
        message:
          "DeadlineZero could not create tasks from your prompt, so your workload was left unchanged. Try again with a clearer task description.",
        type: "ai",
        priority: "critical",
        actionLink: "/dashboard#generator",
        metadata: {
          eventType: "ai-task-failed",
          reason:
            "AI failures are critical because generated tasks should never fail silently.",
        },
        dedupeKey: `ai-task-failed:${req.user.id}:${new Date().toISOString().slice(0, 10)}`,
      });
    }

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
exports.regenerateDailyPlan = async (req, res) => {
  return exports.getDailyPlan(req, res);
};

exports.getDailyPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const priorityRank = { high: 1, medium: 2, low: 3 };

    const tasks = await Task.find({
      user: userId,
      status: "pending",
    })
      .sort({ deadline: 1, createdAt: 1 })
      .lean();

    tasks.sort((a, b) => {
      const ar = priorityRank[String(a.priority || "medium").toLowerCase()] ?? 2;
      const br = priorityRank[String(b.priority || "medium").toLowerCase()] ?? 2;
      if (ar !== br) return ar - br;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    if (tasks.length === 0) {
      const emptyPlan = { summary: "No pending tasks found.", plan: [] };
      const storedPlan = await saveTodayPlan(user, emptyPlan);
      await createPlannerNotification(userId, "generated", { scheduledTasks: 0 });
      await dismissNotifications({
        user: userId,
        type: "ai",
        "metadata.eventType": "ai-plan-failed",
      });

      return res.status(200).json({
        success: true,
        message: "No pending tasks found.",
        dailyPlan: storedPlan.dailyPlan,
        planGeneratedDate: storedPlan.planGeneratedDate,
        planSyncedToCalendar: storedPlan.planSyncedToCalendar,
        lastPlanGenerated: storedPlan.lastPlanGenerated,
        planOutdated: storedPlan.planOutdated,
      });
    }

    const dailyPlan = await generateDailyPlan(tasks, user);

    user.dailyPlan = null;
    const storedPlan = await saveTodayPlan(user, dailyPlan);

    await createPlannerNotification(userId, "generated", {
      scheduledTasks: dailyPlan.plan?.length || 0,
      focusTitle: dailyPlan.focusTitle,
    });
    await dismissNotifications({
      user: userId,
      type: "ai",
      "metadata.eventType": "ai-plan-failed",
    });

    return res.status(200).json({
      success: true,
      message: "Daily plan generated successfully.",
      dailyPlan: storedPlan.dailyPlan,
      planGeneratedDate: storedPlan.planGeneratedDate,
      planSyncedToCalendar: storedPlan.planSyncedToCalendar,
      lastPlanGenerated: storedPlan.lastPlanGenerated,
      planOutdated: storedPlan.planOutdated,
    });

  } catch (error) {
    console.error("Daily Planner Error:", error);
    if (req.user?.id) {
      await createNotification({
        user: req.user.id,
        title: "AI Planner Failed",
        message:
          "DeadlineZero could not generate your daily plan, so your previous schedule was not replaced. Try again after checking your tasks.",
        type: "ai",
        priority: "critical",
        actionLink: "/dashboard#planner",
        metadata: {
          eventType: "ai-plan-failed",
          reason:
            "AI planner failures are critical because users depend on the schedule to decide what to do next.",
        },
        dedupeKey: `ai-plan-failed:${req.user.id}:${new Date().toISOString().slice(0, 10)}`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate daily plan.",
      error: error.message,
    });
  }
};