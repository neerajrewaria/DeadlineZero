const Task = require("../models/Task");

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

    // Return updated task
    return res.status(200).json({
      success: true,
      message: "Task marked as completed.",
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