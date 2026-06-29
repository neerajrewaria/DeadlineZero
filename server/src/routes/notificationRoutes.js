const express = require("express");
const router = express.Router();

const { authentication } = require("../middleware/auth");
const {
  deleteNotification,
  getNotifications,
  getUnreadCount,
  markBrowserNotificationShown,
  markAllNotificationsRead,
  markNotificationRead,
} = require("../controllers/notificationController");

router.get("/", authentication, getNotifications);
router.get("/unread-count", authentication, getUnreadCount);
router.patch("/read-all", authentication, markAllNotificationsRead);
router.patch("/:id/browser-shown", authentication, markBrowserNotificationShown);
router.patch("/:id/read", authentication, markNotificationRead);
router.delete("/:id", authentication, deleteNotification);

module.exports = router;
