const Notification = require("../models/Notification");
const {
  analyzeDeadlinesForUser,
  getActiveQuery,
} = require("../services/notificationService");

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await analyzeDeadlinesForUser(userId);

    const since = req.query.since ? new Date(req.query.since) : null;
    const query = getActiveQuery({
      user: userId,
      ...(since && !Number.isNaN(since.getTime()) ? { updatedAt: { $gt: since } } : {}),
    });

    const notifications = await Notification.find(query)
      .sort({ priorityRank: 1, isRead: 1, updatedAt: -1, createdAt: -1 })
      .limit(30)
      .populate("relatedTask", "title deadline priority status calendarEventId calendarEventLink")
      .lean();
    const dismissedIds = since && !Number.isNaN(since.getTime())
      ? await Notification.find({
          user: userId,
          isDismissed: true,
          updatedAt: { $gt: since },
        }).distinct("_id")
      : [];
    const unreadCount = await Notification.countDocuments({
      isRead: false,
      ...getActiveQuery({ user: userId }),
    });

    return res.status(200).json({
      success: true,
      notifications,
      dismissedIds,
      unreadCount,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
      error: error.message,
    });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    await analyzeDeadlinesForUser(userId);

    const unreadCount = await Notification.countDocuments({
      isRead: false,
      ...getActiveQuery({ user: userId }),
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Unread Count Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread notification count.",
      error: error.message,
    });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
        isDismissed: false,
      },
      {
        isRead: true,
      },
      {
        new: true,
      }
    ).populate("relatedTask", "title deadline priority status calendarEventId calendarEventLink");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Read Notification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read.",
      error: error.message,
    });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        isRead: false,
        ...getActiveQuery({ user: req.user.id }),
      },
      {
        isRead: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("Read All Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read.",
      error: error.message,
    });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
        deletedAt: null,
      },
      {
        isDismissed: true,
        dismissedAt: new Date(),
        isRead: true,
        "metadata.dismissReason": "user",
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification dismissed.",
    });
  } catch (error) {
    console.error("Dismiss Notification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to dismiss notification.",
      error: error.message,
    });
  }
};

exports.markBrowserNotificationShown = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
        browserNotifiedAt: null,
        isDismissed: false,
      },
      {
        browserNotifiedAt: new Date(),
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(200).json({
        success: true,
        message: "Browser notification was already recorded.",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Browser Notification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to record browser notification.",
      error: error.message,
    });
  }
};
