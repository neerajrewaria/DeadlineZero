const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "deadline",
        "dueToday",
        "overdue",
        "calendar",
        "ai",
        "planner",
        "task",
        "productivity",
        "warning",
        "success",
        "system",
      ],
      default: "system",
      index: true,
    },
    priority: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
      index: true,
    },
    relatedTask: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDismissed: {
      type: Boolean,
      default: false,
      index: true,
    },
    dismissedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    browserNotifiedAt: {
      type: Date,
      default: null,
    },
    priorityRank: {
      type: Number,
      default: 2,
      index: true,
    },
    actionLink: {
      type: String,
      default: "",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ user: 1, isDismissed: 1, isRead: 1, priorityRank: 1, updatedAt: -1 });
notificationSchema.index({ user: 1, type: 1, relatedTask: 1, "metadata.key": 1 });
notificationSchema.index({ user: 1, "metadata.key": 1, isDismissed: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
