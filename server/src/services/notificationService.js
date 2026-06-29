const Notification = require("../models/Notification");
const Task = require("../models/Task");
const User = require("../models/User");

const DAY_MS = 24 * 60 * 60 * 1000;

const PRIORITY_RANK = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const getDateKey = (date) => date.toISOString().slice(0, 10);

const addDays = (days) => new Date(Date.now() + days * DAY_MS);

const getExpiryDate = (type, priority, metadata = {}) => {
  if (priority === "critical") return null;
  if (type === "task") return addDays(7);
  if (type === "productivity") return addDays(3);
  if (type === "calendar" && metadata.eventType === "synced") return addDays(7);
  return null;
};

const getActiveQuery = (extra = {}) => {
  const now = new Date();
  return {
    isDismissed: false,
    deletedAt: null,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    ...extra,
  };
};

const formatTime = (date, timeZone = "Asia/Kolkata") => {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(date);
};

const getTimeLeftText = (deadline, now) => {
  const minutesLeft = Math.max(0, Math.round((deadline - now) / 60000));
  if (minutesLeft < 60) {
    return `due in ${minutesLeft || 1} min`;
  }
  const hoursLeft = Math.round(minutesLeft / 60);
  return `due in ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}`;
};

const getOverdueText = (deadline, now) => {
  const minutesLate = Math.max(1, Math.round((now - deadline) / 60000));
  if (minutesLate < 60) {
    return `expired ${minutesLate} min ago`;
  }
  const hoursLate = Math.round(minutesLate / 60);
  if (hoursLate < 24) {
    return `expired ${hoursLate} hour${hoursLate === 1 ? "" : "s"} ago`;
  }
  const daysLate = Math.round(hoursLate / 24);
  return daysLate === 1 ? "expired yesterday" : `expired ${daysLate} days ago`;
};

const parsePlanTime = (baseDate, time) => {
  if (!time || typeof time !== "string") return null;
  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const period = match[3]?.toUpperCase();

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  const date = new Date(baseDate);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const buildKey = ({ type, relatedTask, key }) => {
  return [type, relatedTask || "none", key || getDateKey(new Date())].join(":");
};

const dismissNotifications = async (query) => {
  return Notification.updateMany(getActiveQuery(query), {
    isDismissed: true,
    dismissedAt: new Date(),
    isRead: true,
    "metadata.dismissReason": "system",
  });
};

const createNotification = async ({
  user,
  title,
  message,
  type = "system",
  priority = "medium",
  relatedTask = null,
  actionLink = "",
  metadata = {},
  dedupeKey = "",
  expiresAt,
}) => {
  if (!user || !title || !message) return null;

  const key = dedupeKey || buildKey({ type, relatedTask, key: metadata.key });
  const existing = await Notification.findOne({
    user,
    "metadata.key": key,
    deletedAt: null,
  });

  if (existing?.isDismissed && existing.metadata?.dismissReason === "user") {
    return null;
  }

  const oldStage = existing?.metadata?.stage;
  const nextStage = metadata.stage;
  const stageChanged = oldStage && nextStage && oldStage !== nextStage;
  const shouldMakeUnread = Boolean(
    metadata.forceUnread || stageChanged || existing?.isDismissed
  );
  const expiry =
    expiresAt === undefined
      ? getExpiryDate(type, priority, metadata)
      : expiresAt;

  const payload = {
    user,
    title,
    message,
    type,
    priority,
    priorityRank: PRIORITY_RANK[priority] ?? PRIORITY_RANK.medium,
    relatedTask,
    actionLink,
    expiresAt: expiry,
    metadata: { ...metadata, key },
  };

  if (existing) {
    existing.set({
      ...payload,
      isDismissed: false,
      dismissedAt: null,
      isRead: shouldMakeUnread ? false : existing.isRead,
    });
    await existing.save();
    return existing;
  }

  return Notification.create(payload);
};

const createTaskNotification = async (userId, task, eventType) => {
  if (["completed", "deleted"].includes(eventType)) {
    await dismissNotifications({
      user: userId,
      relatedTask: task._id,
      type: { $in: ["deadline", "dueToday", "overdue"] },
    });
  }

  const titleByEvent = {
    added: `${task.title} was added.`,
    updated: `${task.title} was updated.`,
    deleted: `${task.title} was deleted.`,
    completed: `${task.title} was completed.`,
    reopened: `${task.title} was reopened.`,
  };

  const messageByEvent = {
    added: `It is now part of your workload, so DeadlineZero will watch its deadline and planning impact.`,
    updated: `Its details changed, so your AI planner may need a fresh schedule.`,
    deleted: `The task was removed, so related deadline warnings are now resolved.`,
    completed: `Great progress. Related deadline warnings are now resolved.`,
    reopened: `It is pending again, so DeadlineZero will include it in deadline and planner checks.`,
  };

  return createNotification({
    user: userId,
    title: titleByEvent[eventType] || `${task.title} changed.`,
    message:
      messageByEvent[eventType] ||
      `This change may affect your plan and deadline risk.`,
    type: "task",
    priority: eventType === "completed" ? "low" : "medium",
    relatedTask: eventType === "deleted" ? null : task._id,
    actionLink: "/dashboard#tasks",
    metadata: {
      eventType,
      taskTitle: task.title,
      reason:
        "Task activity affects workload, planning, and deadline risk.",
    },
    dedupeKey: `task:${eventType}:${task._id}`,
  });
};

const createPlannerNotification = async (userId, eventType, metadata = {}) => {
  if (eventType === "generated") {
    await dismissNotifications({
      user: userId,
      type: "planner",
      "metadata.eventType": "outdated",
    });
  }

  const map = {
    generated: {
      title: "AI Planner Ready",
      message:
        "Your AI planner prepared an optimized schedule based on priorities and deadlines.",
      type: "ai",
      priority: "medium",
    },
    outdated: {
      title: "AI Plan Needs Update",
      message:
        "Your tasks changed, so the current plan may no longer be the best use of your time.",
      type: "planner",
      priority: "critical",
    },
  };
  const data = map[eventType] || map.generated;

  return createNotification({
    user: userId,
    ...data,
    actionLink: "/dashboard#planner",
    metadata: {
      eventType,
      reason:
        "Planner notifications protect you from following a stale schedule.",
      ...metadata,
    },
    dedupeKey: `planner:${eventType}:${userId}:${getDateKey(new Date())}`,
  });
};

const createCalendarNotification = async (userId, eventType, metadata = {}) => {
  if (eventType === "synced") {
    await dismissNotifications({
      user: userId,
      type: "calendar",
      "metadata.eventType": "sync-failed",
    });
  }

  const syncedMessage =
    metadata.createdCount > 0
      ? `Today's AI schedule has been successfully synced to Google Calendar with ${metadata.createdCount} event${metadata.createdCount === 1 ? "" : "s"}.`
      : metadata.updatedCount > 0
      ? `Today's AI schedule updated ${metadata.updatedCount} existing Google Calendar event${metadata.updatedCount === 1 ? "" : "s"}.`
      : "Today's AI schedule is already synced to Google Calendar, so your calendar remains up to date.";

  const map = {
    connected: {
      title: "Google Calendar Connected",
      message:
        "DeadlineZero can now place AI schedule blocks on your calendar when you choose to sync.",
      priority: "medium",
    },
    synced: {
      title: "Calendar Sync Complete",
      message: syncedMessage,
      priority: "high",
    },
    "sync-failed": {
      title: "Calendar Sync Failed",
      message: metadata.error
        ? `Google Calendar could not sync your AI schedule because ${metadata.error}. Reconnect or try syncing again.`
        : "Google Calendar could not sync your AI schedule. Reconnect or try syncing again.",
      priority: "critical",
    },
  };
  const data = map[eventType] || map.synced;

  return createNotification({
    user: userId,
    title: data.title,
    message: data.message,
    type: "calendar",
    priority: data.priority,
    actionLink: metadata.calendarLink || "/dashboard#planner",
    metadata: {
      eventType,
      reason:
        "Calendar notifications confirm whether your AI plan is visible outside DeadlineZero.",
      ...metadata,
    },
    dedupeKey: `calendar:${eventType}:${userId}:${getDateKey(new Date())}`,
  });
};

const createProductivityNotification = async (
  userId,
  previousScore,
  nextScore
) => {
  if (
    previousScore == null ||
    nextScore == null ||
    previousScore === nextScore
  )
    return null;

  const increased = nextScore > previousScore;

  return createNotification({
    user: userId,
    title: increased ? "Great Progress" : "Productivity Alert",
    message: increased
      ? `Your productivity increased from ${previousScore}% to ${nextScore}% because more planned work is getting completed.`
      : `Your productivity changed from ${previousScore}% to ${nextScore}%, so review unfinished high-priority tasks before they become urgent.`,
    type: "productivity",
    priority: increased ? "low" : "medium",
    actionLink: "/analytics",
    metadata: {
      previousScore,
      nextScore,
      direction: increased ? "up" : "down",
      reason:
        "Productivity changes help you decide whether to adjust today's plan.",
    },
    dedupeKey: `productivity:${userId}:${getDateKey(new Date())}`,
  });
};

// ─── Timezone-aware date helpers ──────────────────────────────────────────────
//
// ROOT CAUSE OF THE BUG THIS FIXES:
//
// The old code used:
//   const startToday = new Date(now);
//   startToday.setHours(0, 0, 0, 0);          // zeroes in SERVER timezone (UTC)
//   deadlineDate.setHours(0, 0, 0, 0);        // zeroes in SERVER timezone (UTC)
//
// setHours() always operates in the JS engine's local timezone, which on any
// cloud/Linux server is UTC.  A task with a deadline of "today 8:40 PM IST"
// is stored in MongoDB as "today 3:10 PM UTC".  When setHours(0,0,0,0) is
// called on it, you get "today 00:00 UTC" = "yesterday 5:30 AM IST".
// That date is BEFORE startToday (also "today 00:00 UTC"), so dayDiff comes
// out as -1 or 0 with a wrong reference point, and the stage calculation
// then incorrectly fires "overdue".
//
// THE FIX:
// Always derive the calendar date string ("YYYY-MM-DD") in the user's own
// timezone using Intl.DateTimeFormat (en-CA gives ISO order: YYYY-MM-DD).
// Compare only those date strings to get dayDiff.  The actual overdue check
// still compares raw timestamps (deadline vs now), which is always correct
// regardless of timezone.

/**
 * Returns "YYYY-MM-DD" for a given Date in the specified IANA timezone.
 * Uses en-CA locale so the format is always YYYY-MM-DD without any fuss.
 */
const getDateStringInTimezone = (date, timeZone) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

/**
 * Returns the day difference between two dates in the user's timezone.
 *
 * dayDiff = 0  → same calendar day  (today)
 * dayDiff = 1  → next calendar day  (tomorrow)
 * dayDiff = -1 → previous day       (yesterday / overdue by calendar)
 *
 * We intentionally do NOT use setHours(0,0,0,0) here because that zeroes
 * in the server's local timezone (UTC on Linux), not the user's timezone.
 */
const getCalendarDayDiff = (fromDate, toDate, timeZone) => {
  const fromStr = getDateStringInTimezone(fromDate, timeZone);
  const toStr = getDateStringInTimezone(toDate, timeZone);

  // Parse as UTC midnight so arithmetic is safe and DST-free.
  const fromMs = Date.UTC(
    ...fromStr.split("-").map((v, i) => (i === 1 ? Number(v) - 1 : Number(v)))
  );
  const toMs = Date.UTC(
    ...toStr.split("-").map((v, i) => (i === 1 ? Number(v) - 1 : Number(v)))
  );

  return Math.round((toMs - fromMs) / DAY_MS);
};

// ─── Deadline stage ───────────────────────────────────────────────────────────

const getDeadlineStage = (deadline, now, dayDiff) => {
  // Always check raw timestamps first — this is always correct.
  if (deadline < now) return "overdue";

  if (dayDiff === 0) {
    const hoursLeft = (deadline - now) / (60 * 60 * 1000);
    if (hoursLeft <= 1) return "due-1h";
    if (hoursLeft <= 3) return "due-3h";
    if (hoursLeft <= 6) return "due-6h";
    return "today";
  }

  return "tomorrow";
};

const getDeadlinePayload = (task, deadline, now, dayDiff, timeZone) => {
  const stage = getDeadlineStage(deadline, now, dayDiff);

  if (stage === "overdue") {
    return {
      title: `${task.title} is overdue`,
      message: `${task.title} ${getOverdueText(deadline, now)}. Complete it or adjust your plan so it does not keep blocking your day.`,
      type: "overdue",
      priority: "critical",
      stage,
    };
  }

  if (dayDiff === 0) {
    return {
      title: `${task.title} is due today`,
      message: `${task.title} is due today at ${formatTime(deadline, timeZone)} and is ${getTimeLeftText(deadline, now)}. Prioritize it before lower-impact work.`,
      type: "dueToday",
      priority: "critical",
      stage,
    };
  }

  return {
    title: `${task.title} is due tomorrow`,
    message: `${task.title} is due tomorrow at ${formatTime(deadline, timeZone)}. Scheduling it now reduces tomorrow's workload pressure.`,
    type: "deadline",
    priority: "high",
    stage,
  };
};

// ─── Main deadline analyser ───────────────────────────────────────────────────

const analyzeDeadlinesForUser = async (userId) => {
  const now = new Date();
  const user = await User.findById(userId)
    .select("dailyPlan planGeneratedDate timezone")
    .lean();

  const timeZone = user?.timezone || "Asia/Kolkata";

  // Fetch tasks due today or tomorrow (in user's timezone).
  // We look ahead 2 calendar days worth of ms as a safe upper bound —
  // the precise per-task dayDiff is recalculated below in timezone.
  const endTomorrow = new Date(now.getTime() + 2 * DAY_MS);

  const tasks = await Task.find({
    user: userId,
    status: { $ne: "completed" },
    deadline: { $lte: endTomorrow },
  }).lean();

  const notifications = [];

  for (const task of tasks) {
    const deadline = new Date(task.deadline);

    // ── FIX: compute dayDiff in the user's timezone, not server UTC ──────────
    // getCalendarDayDiff(now → deadline) tells us whether the deadline falls
    // on today (0), tomorrow (1), or is already in the past (<0) in the
    // user's local calendar — regardless of what timezone the server runs in.
    const dayDiff = getCalendarDayDiff(now, deadline, timeZone);

    // Skip tasks that are more than 1 day away — they don't need a notification yet.
    if (dayDiff > 1) continue;

    const deadlinePayload = getDeadlinePayload(
      task,
      deadline,
      now,
      dayDiff,
      timeZone
    );

    notifications.push(
      await createNotification({
        user: userId,
        title: deadlinePayload.title,
        message: deadlinePayload.message,
        type: deadlinePayload.type,
        priority: deadlinePayload.priority,
        relatedTask: task._id,
        actionLink: task.calendarEventLink || "/dashboard#tasks",
        metadata: {
          taskTitle: task.title,
          deadline,
          stage: deadlinePayload.stage,
          reason:
            "Deadline notifications evolve in place so one task never spams the inbox.",
        },
        dedupeKey: `deadline:${task._id}`,
      })
    );
  }

  // ── Upcoming AI session reminders (unchanged) ─────────────────────────────
  const todayKey = getDateKey(now);

  if (user?.dailyPlan?.plan?.length && user.planGeneratedDate === todayKey) {
    const upcomingWindowEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    for (const item of user.dailyPlan.plan) {
      const sessionStart = parsePlanTime(now, item.startTime);

      if (
        sessionStart &&
        sessionStart >= now &&
        sessionStart <= upcomingWindowEnd
      ) {
        notifications.push(
          await createNotification({
            user: userId,
            title: `Upcoming AI Session: ${item.taskTitle}`,
            message: `${item.taskTitle} starts at ${item.startTime}. This reminder keeps your AI schedule actionable inside the next two hours.`,
            type: "planner",
            priority: item.priority === "high" ? "high" : "medium",
            actionLink: "/dashboard#planner",
            metadata: {
              taskTitle: item.taskTitle,
              startTime: item.startTime,
              reason:
                "Upcoming sessions help you act on the schedule at the right time.",
            },
            dedupeKey: `ai-session:${userId}:${item.taskTitle}:${item.startTime}:${todayKey}`,
          })
        );
      }
    }
  }

  return notifications.filter(Boolean);
};

const analyzeDeadlinesForAllUsers = async () => {
  const users = await User.find({ isActive: true }).select("_id").lean();
  for (const user of users) {
    await analyzeDeadlinesForUser(user._id);
  }
};

module.exports = {
  analyzeDeadlinesForAllUsers,
  analyzeDeadlinesForUser,
  createCalendarNotification,
  createNotification,
  createPlannerNotification,
  createProductivityNotification,
  createTaskNotification,
  dismissNotifications,
  getActiveQuery,
};