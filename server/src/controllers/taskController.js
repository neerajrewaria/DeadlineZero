const Task = require("../models/Task");
const User = require("../models/User");
const { getTodayPlanPayload, markUserPlanOutdated } = require("../utils/dailyPlan");
const {
  createNotification,
  createPlannerNotification,
  createTaskNotification,
} = require("../services/notificationService");

const buildTaskPayload = (body) => {
  const allowedFields = [
    "title",
    "description",
    "category",
    "deadline",
    "estimatedHours",
    "importance",
    "difficulty",
    "source",
    "isReminderSent",
    "isArchived",
    "isRecurring",
    "recurrencePattern",
    "motivationLevel",
    "actualHoursSpent",
    "priority",
    "status",
    "scheduledStart",
    "scheduledEnd",
    "completionPercentage",
    "isCrisisMode",
    "crisisActivatedAt",
    "aiPriorityScore",
    "aiSummary",
    "aiReasoning",
    "aiSuggestions",
    "tags",
  ];
  const payload = {};

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  return payload;
};

// ==========================================
// Create Task
// ==========================================
exports.createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const payload = buildTaskPayload(req.body);

    if (!payload.title || !payload.deadline) {
      return res.status(400).json({
        success: false,
        message: "Task title and deadline are required.",
      });
    }

    const task = await Task.create({
      ...payload,
      user: userId,
    });

    await markUserPlanOutdated(userId);
    await createTaskNotification(userId, task, "added");
    await createPlannerNotification(userId, "outdated", {
      source: "task-added",
      taskTitle: task.title,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      task,
    });
  } catch (error) {
    console.error("Create Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create task.",
      error: error.message,
    });
  }
};

// ==========================================
// Get All Tasks of Logged-in User
// ==========================================
exports.getAllTasks = async (req, res) => {
  try {
    // Get logged-in user's ID from JWT middleware
    const userId = req.user.id;

    // Find all tasks of this user
    // Sort by nearest deadline first
    const tasks = await Task.find({ user: userId }).sort({ deadline: 1 }).lean();
    //   Why?

    // .lean() tells Mongoose:

    // "I only want plain JavaScript objects. Don't create full Mongoose documents."

    // Benefits:

    // Faster responses
    // Less memory
    // Great for read-only APIs like this


    // Return success response
    return res.status(200).json({
      success: true,
      totalTasks: tasks.length,
      tasks,
    });

  } catch (error) {
    console.error("Get All Tasks Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks.",
      error: error.message,
    });
  }
};

// ==========================================
// Mark Task as Completed
// ==========================================
exports.completeTask = async (req, res) => {
  try {
    // Get task id from URL
    const { taskId } = req.params;

    // Logged-in user
    const userId = req.user.id;

    // Find task that belongs to this user
    const task = await Task.findOne({
      _id: taskId,
      user: userId,
    });

    // Task not found
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    // Prevent completing twice
    if (task.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Task is already completed.",
      });
    }

    // Update task
    task.status = "completed";
    task.completionPercentage = 100;
    task.completedAt = new Date();

    // Save changes
    await task.save();
    await markUserPlanOutdated(userId);
    await createTaskNotification(userId, task, "completed");
    await createPlannerNotification(userId, "outdated", {
      source: "task-completed",
      taskTitle: task.title,
    });

    // Patch Google Calendar event (do not create new events; never delete).
    // Keep this operation best-effort so task completion still succeeds.
    let calendarUpdated = false;
    let calendarWarning = null;
    try {
      if (task.calendarEventId) {
        const { updateGoogleCalendarEventForTask } = require("./calendarController");
        const result = await updateGoogleCalendarEventForTask({
          user: await User.findById(userId).select(
            "googleCalendarConnected googleAccessToken googleRefreshToken googleTokenExpiry timezone"
          ),
          task,
          action: "completed",
          completionTime: new Date().toLocaleString(),
        });
        calendarUpdated = result?.skipped === false;
      }
    } catch (e) {
      calendarUpdated = false;
      calendarWarning =
        e.message || "Task completed, but Google Calendar could not be updated.";
      console.error("Complete Task Calendar Update Error:", e);
      await createNotification({
        user: userId,
        title: "Calendar Update Failed",
        message: `${task.title} was completed in DeadlineZero, but its Google Calendar event could not be updated. ${calendarWarning}`,
        type: "calendar",
        priority: "critical",
        relatedTask: task._id,
        actionLink: "/dashboard#planner",
        metadata: {
          eventType: "calendar-update-failed",
          taskTitle: task.title,
          reason: "Calendar event updates should never fail silently.",
        },
        dedupeKey: `calendar:update-failed:${task._id}:${new Date().toISOString().slice(0, 10)}`,
      });
    }

    if (calendarUpdated) {
      // One combined notification using existing Notification model.
      // Dedupe key: calendar:update:<taskId>:<YYYY-MM-DD>
      const dateKey = new Date().toISOString().slice(0, 10);

      await createNotification({
        user: userId,
        title: "Task Completed & Calendar Updated",
        message: `${task.title} was marked as completed and synchronized with Google Calendar.`,
        type: "calendar",
        priority: "high",
        relatedTask: null,
        actionLink: "/dashboard#planner",
        metadata: {
          eventType: "calendar",
          reason: "Calendar updated after task completion.",
        },
        dedupeKey: `calendar:update:${task._id}:${dateKey}`,
      });
    }


    // Return updated task
    return res.status(200).json({
      success: true,
      message: calendarWarning
        ? "Task marked as completed, but Google Calendar could not be updated."
        : "Task marked as completed.",
      calendarUpdated,
      calendarWarning,
      task,
    });


  } catch (error) {
    console.error("Complete Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to complete task.",
      error: error.message,
    });
  }
};


// ==========================================
// Get Dashboard Statistics
// ==========================================
exports.getDashboardStats = async (req, res) => {
  try {
    // Logged-in user
    const userId = req.user.id;

    // Get all tasks of this user
    const tasks = await Task.find({ user: userId }).lean();

    // Today's date
    const today = new Date();

    // Statistics
    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    const pendingTasks = tasks.filter(
      (task) => task.status === "pending"
    ).length;

    const overdueTasks = tasks.filter(
      (task) =>
        task.status !== "completed" &&
        new Date(task.deadline) < today
    ).length;

    const completionRate =
      totalTasks === 0
        ? 0
        : Number(((completedTasks / totalTasks) * 100).toFixed(2));

    return res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics.",
      error: error.message,
    });
  }
};

// ==========================================
// Mark Task as Pending
// ==========================================
exports.markTaskPending = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await Task.findOne({
      _id: taskId,
      user: userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    task.status = "pending";
    task.completionPercentage = 0;
    task.completedAt = null;

    await task.save();
    await markUserPlanOutdated(userId);
    await createTaskNotification(userId, task, "reopened");
    await createPlannerNotification(userId, "outdated", {
      source: "task-reopened",
      taskTitle: task.title,
    });

    // Patch Google Calendar event back to pending (title/color/description completion block).
    let calendarUpdated = false;
    let calendarWarning = null;
    try {
      if (task.calendarEventId) {
        const { updateGoogleCalendarEventForTask } = require("./calendarController");
        const result = await updateGoogleCalendarEventForTask({
          user: await User.findById(userId).select(
            "googleCalendarConnected googleAccessToken googleRefreshToken googleTokenExpiry timezone"
          ),
          task,
          action: "pending",
          completionTime: null,
        });
        calendarUpdated = result?.skipped === false;
      }
    } catch (e) {
      calendarUpdated = false;
      calendarWarning =
        e.message || "Task reopened, but Google Calendar could not be updated.";
      console.error("Mark Pending Calendar Update Error:", e);
      await createNotification({
        user: userId,
        title: "Calendar Update Failed",
        message: `${task.title} was reopened in DeadlineZero, but its Google Calendar event could not be restored. ${calendarWarning}`,
        type: "calendar",
        priority: "critical",
        relatedTask: task._id,
        actionLink: "/dashboard#planner",
        metadata: {
          eventType: "calendar-update-failed",
          taskTitle: task.title,
          reason: "Calendar event updates should never fail silently.",
        },
        dedupeKey: `calendar:update-failed:${task._id}:${new Date().toISOString().slice(0, 10)}`,
      });
    }

    if (calendarUpdated) {
      // We must not create duplicate notifications.
      // Existing createCalendarNotification(...) dedupes by its internal dedupeKey, so we rely on it.
      const dateKey = new Date().toISOString().slice(0, 10);

      await createNotification({
        user: userId,
        title: "Calendar Updated",
        message: `${task.title} was synchronized with Google Calendar.`,
        type: "calendar",
        priority: "high",
        relatedTask: null,
        actionLink: "/dashboard#planner",
        metadata: {
          eventType: "calendar",
          reason: "Calendar updated after task status change.",
        },
        dedupeKey: `calendar:update:${task._id}:${dateKey}`,
      });
    }


    return res.status(200).json({
      success: true,
      message: calendarWarning
        ? "Task marked as pending, but Google Calendar could not be updated."
        : "Task marked as pending.",
      calendarUpdated,
      calendarWarning,
      task,
    });

  } catch (error) {
    console.error("Mark Pending Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark task as pending.",
      error: error.message,
    });
  }
};

// ==========================================
// Update Task
// ==========================================
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const payload = buildTaskPayload(req.body);

    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        user: userId,
      },
      payload,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    await markUserPlanOutdated(userId);
    await createTaskNotification(userId, task, "updated");
    await createPlannerNotification(userId, "outdated", {
      source: "task-updated",
      taskTitle: task.title,
    });

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      task,
    });
  } catch (error) {
    console.error("Update Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update task.",
      error: error.message,
    });
  }
};

// ==========================================
// Delete Task
// ==========================================
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await Task.findOneAndDelete({
      _id: taskId,
      user: userId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    await markUserPlanOutdated(userId);
    await createTaskNotification(userId, task, "deleted");
    await createPlannerNotification(userId, "outdated", {
      source: "task-deleted",
      taskTitle: task.title,
    });

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
      task,
    });
  } catch (error) {
    console.error("Delete Task Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete task.",
      error: error.message,
    });
  }
};

// ==========================================
// Get Today's Stored AI Daily Plan
// ==========================================
exports.getStoredDailyPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "dailyPlan planGeneratedDate planSyncedToCalendar lastPlanGenerated planOutdated timezone"
    );

    const storedPlan = getTodayPlanPayload(user);

    return res.status(200).json({
      success: true,
      storedPlan,
    });
  } catch (error) {
    console.error("Stored Daily Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stored daily plan.",
      error: error.message,
    });
  }
};
