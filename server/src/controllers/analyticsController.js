const Task = require("../models/Task");
const User = require("../models/User");
const { createProductivityNotification } = require("../services/notificationService");

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await Task.find({ user: userId });

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    const pendingTasks = tasks.filter(
      (task) => task.status === "pending"
    ).length;

    const overdueTasks = tasks.filter(
      (task) =>
        task.status === "pending" &&
        new Date(task.deadline) < new Date()
    ).length;

    const completionRate =
      totalTasks === 0
        ? 0
        : Number(
            ((completedTasks / totalTasks) * 100).toFixed(1)
          );

    // --------------------------
    // Category Statistics
    // --------------------------

    const categoryStats = {};

    tasks.forEach((task) => {
      categoryStats[task.category] =
        (categoryStats[task.category] || 0) + 1;
    });

    // --------------------------
    // Priority Statistics
    // --------------------------

    const priorityStats = {};

    tasks.forEach((task) => {
      priorityStats[task.priority] =
        (priorityStats[task.priority] || 0) + 1;
    });

    // --------------------------
    // Weekly Completion
    // --------------------------

    const weeklyCompletion = Array(7).fill(0);

    tasks.forEach((task) => {
      if (task.status === "completed" && task.updatedAt) {
        const day = new Date(task.updatedAt).getDay();
        weeklyCompletion[day]++;
      }
    });

    // --------------------------
    // Monthly Completion
    // --------------------------

    const monthlyCompletion = Array(12).fill(0);

    tasks.forEach((task) => {
      if (task.status === "completed" && task.updatedAt) {
        const month = new Date(task.updatedAt).getMonth();
        monthlyCompletion[month]++;
      }
    });

    // --------------------------
    // Productivity Score
    // --------------------------

    const productivityScore = Math.min(
      100,
      completionRate + completedTasks * 2
    );

    const user = await User.findById(userId).select("productivityScore");
    const previousScore = user?.productivityScore ?? null;

    if (user && Math.round(previousScore) !== Math.round(productivityScore)) {
      await createProductivityNotification(
        userId,
        Math.round(previousScore),
        Math.round(productivityScore)
      );
      user.productivityScore = Math.round(productivityScore);
      await user.save();
    }

    return res.status(200).json({
      success: true,

      analytics: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate,
        productivityScore,
        categoryStats,
        priorityStats,
        weeklyCompletion,
        monthlyCompletion,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics.",
      error: error.message,
    });
  }
};
