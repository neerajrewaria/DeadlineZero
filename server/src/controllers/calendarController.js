const crypto = require("crypto");
const { google } = require("googleapis");
const Task = require("../models/Task");
const User = require("../models/User");
const oauth2Client = require("../config/googleOAuth");
const { markUserPlanSynced } = require("../utils/dailyPlan");
const { createCalendarNotification } = require("../services/notificationService");

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ─── URL helpers ─────────────────────────────────────────────────────────────

const getFrontendRedirectUrl = (status) => {
  const url = new URL("/dashboard", FRONTEND_URL);
  url.searchParams.set("calendar", status);
  return url.toString();
};

// ─── Token check ─────────────────────────────────────────────────────────────

const hasCalendarTokens = (user) => {
  return Boolean(
    user &&
      user.googleCalendarConnected &&
      user.googleAccessToken &&
      user.googleRefreshToken
  );
};

// ─── Time parsing ─────────────────────────────────────────────────────────────

const parseTime = (time) => {
  if (!time || typeof time !== "string") {
    throw new Error("Invalid plan time.");
  }

  const trimmed = time.trim();
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);

  if (!match) {
    throw new Error(`Invalid time format: ${time}`);
  }

  let hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const period = match[3]?.toUpperCase();

  if (minute < 0 || minute > 59) {
    throw new Error(`Invalid minutes in time: ${time}`);
  }

  if (period) {
    if (hour < 1 || hour > 12) {
      throw new Error(`Invalid hour in time: ${time}`);
    }
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
  } else if (hour < 0 || hour > 23) {
    throw new Error(`Invalid hour in time: ${time}`);
  }

  return {
    hour,
    minute,
    sortableMinutes: hour * 60 + minute,
    formatted: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
  };
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

const getTodayInTimezone = (timeZone) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
};

const addDaysToDateString = (dateString, days) => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
};

const buildCalendarDateTimes = (task, dateString, timeZone) => {
  const start = parseTime(task.startTime);
  const end = parseTime(task.endTime);
  const endDateString =
    end.sortableMinutes <= start.sortableMinutes
      ? addDaysToDateString(dateString, 1)
      : dateString;

  return {
    start: {
      dateTime: `${dateString}T${start.formatted}`,
      timeZone,
    },
    end: {
      dateTime: `${endDateString}T${end.formatted}`,
      timeZone,
    },
  };
};

// ─── Event ID ─────────────────────────────────────────────────────────────────

const getEventId = (userId, dateString, task) => {
  const raw = [
    userId,
    dateString,
    task.taskTitle || task.title || "",
    task.startTime || "",
    task.endTime || "",
  ].join("|");
  return crypto.createHash("sha256").update(raw).digest("hex");
};

// ─── Task linkage ─────────────────────────────────────────────────────────────

const saveCalendarEventOnTask = async (userId, title, event) => {
  if (!title || !event?.id) return;
  await Task.findOneAndUpdate(
    { user: userId, title },
    {
      calendarEventId: event.id,
      calendarEventLink: event.htmlLink || "",
    },
    { sort: { deadline: 1 } }
  );
};

// ─── Local time string ────────────────────────────────────────────────────────

const getLocalTimeString = (timeZone = "Asia/Kolkata", date = new Date()) => {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone,
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
};

// ─── Extended properties sanitiser ───────────────────────────────────────────
// Google Calendar rejects null/undefined values in extendedProperties.
// Only string values are allowed. This strips any non-string or falsy values.

const sanitizeExtendedProperties = (obj = {}) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== null && v !== undefined && v !== ""
    )
  );
};

// ─── Pre-send payload validation ──────────────────────────────────────────────

const ISO_DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

const validateEventPayload = (eventResource, context = "") => {
  const { summary, start, end } = eventResource;

  if (!summary || typeof summary !== "string" || !summary.trim()) {
    throw new Error(
      `${context} Event summary (title) is missing or empty.`
    );
  }
  if (!start?.dateTime) {
    throw new Error(
      `${context} start.dateTime is missing. Received: ${JSON.stringify(start)}`
    );
  }
  if (!start?.timeZone) {
    throw new Error(
      `${context} start.timeZone is missing. Received: ${JSON.stringify(start)}`
    );
  }
  if (!end?.dateTime) {
    throw new Error(
      `${context} end.dateTime is missing. Received: ${JSON.stringify(end)}`
    );
  }
  if (!end?.timeZone) {
    throw new Error(
      `${context} end.timeZone is missing. Received: ${JSON.stringify(end)}`
    );
  }
  if (!ISO_DATETIME_PATTERN.test(start.dateTime)) {
    throw new Error(
      `${context} start.dateTime has invalid format: "${start.dateTime}". Expected YYYY-MM-DDTHH:MM:SS`
    );
  }
  if (!ISO_DATETIME_PATTERN.test(end.dateTime)) {
    throw new Error(
      `${context} end.dateTime has invalid format: "${end.dateTime}". Expected YYYY-MM-DDTHH:MM:SS`
    );
  }
};

// ─── Completion description helpers ──────────────────────────────────────────

const COMPLETION_BLOCK_DELIMITER = "---";

const appendCompletionDetailsToDescription = (existingDescription = "", completionTime) => {
  const base = String(existingDescription || "");
  const trimmed = base.trimEnd();
  return (
    `${trimmed}\n${COMPLETION_BLOCK_DELIMITER}\n\n` +
    `Status : Completed\n` +
    `Completed via DeadlineZero\n` +
    `Completion Time : ${completionTime}`
  );
};

const removeCompletionDetailsFromDescription = (existingDescription = "") => {
  const base = String(existingDescription || "");
  const idx = base.lastIndexOf(COMPLETION_BLOCK_DELIMITER);
  if (idx === -1) return base;
  return base.slice(0, idx).trimEnd();
};

// ─── Title helpers ────────────────────────────────────────────────────────────

const COMPLETED_TITLE_PREFIX = "[Completed] ";

const stripAnyCompletedPrefix = (title = "") => {
  const t = String(title || "").trim();
  return t.startsWith(COMPLETED_TITLE_PREFIX)
    ? t.slice(COMPLETED_TITLE_PREFIX.length)
    : t;
};

const applyCompletedTitle = (originalTitle = "") => {
  const base = stripAnyCompletedPrefix(originalTitle);
  return `${COMPLETED_TITLE_PREFIX}${base}`;
};

const applyPendingTitle = (currentTitle = "") => {
  return stripAnyCompletedPrefix(currentTitle);
};

// ─── Color ID mapping ─────────────────────────────────────────────────────────

const getColorIdMapping = () => ({
  completed: "11", // commonly green in Google Calendar
});

// ─── Low-level patch helper ───────────────────────────────────────────────────

const patchCalendarEvent = async ({ calendar, eventId, resource }) => {
  return calendar.events.patch({
    calendarId: "primary",
    eventId,
    requestBody: resource,
  });
};

// ─── Update event for task completion / pending ───────────────────────────────

const updateGoogleCalendarEventForTask = async ({
  user,
  task,
  action,
  completionTime,
}) => {
  if (!task?.calendarEventId) return { skipped: true };
  if (!hasCalendarTokens(user)) return { skipped: true };

  const auth = await refreshAccessTokenIfNeeded(user);
  const calendar = google.calendar({ version: "v3", auth });
  const timeZone = user.timezone || "Asia/Kolkata";

  const existing = await calendar.events.get({
    calendarId: "primary",
    eventId: task.calendarEventId,
  });

  const originalTitle = stripAnyCompletedPrefix(
    task.title || existing.data.summary || ""
  );
  const originalColorId =
    existing.data?.extendedProperties?.private?.deadlineZeroOriginalColorId ||
    existing.data?.colorId ||
    null;

  const baseDescription = existing.data?.description || "";

  if (action === "completed") {
    const updatedDescription = appendCompletionDetailsToDescription(
      baseDescription,
      completionTime || getLocalTimeString(timeZone)
    );

    const privateProps = sanitizeExtendedProperties({
      ...(existing.data.extendedProperties?.private || {}),
      ...(originalColorId
        ? { deadlineZeroOriginalColorId: String(originalColorId) }
        : {}),
      deadlineZeroCompletionState: "completed",
    });

    const resource = {
      summary: applyCompletedTitle(originalTitle),
      description: updatedDescription,
      colorId: getColorIdMapping().completed,
      extendedProperties: { private: privateProps },
    };

    await patchCalendarEvent({
      calendar,
      eventId: task.calendarEventId,
      resource,
    });

    return { skipped: false };
  }

  if (action === "pending") {
    const updatedDescription = removeCompletionDetailsFromDescription(baseDescription);

    const restoreColorId =
      existing.data?.extendedProperties?.private?.deadlineZeroOriginalColorId ||
      originalColorId ||
      undefined;

    const privateProps = sanitizeExtendedProperties({
      ...(existing.data.extendedProperties?.private || {}),
      deadlineZeroCompletionState: "pending",
    });

    const resource = {
      summary: applyPendingTitle(existing.data.summary || originalTitle),
      description: updatedDescription,
      ...(restoreColorId ? { colorId: String(restoreColorId) } : {}),
      extendedProperties: { private: privateProps },
    };

    await patchCalendarEvent({
      calendar,
      eventId: task.calendarEventId,
      resource,
    });

    return { skipped: false };
  }

  return { skipped: true };
};

exports.updateGoogleCalendarEventForTask = updateGoogleCalendarEventForTask;

// ─── Token refresh ────────────────────────────────────────────────────────────

const refreshAccessTokenIfNeeded = async (user) => {
  const authClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const expiryTime = user.googleTokenExpiry
    ? new Date(user.googleTokenExpiry).getTime()
    : 0;
  const expiresSoon = !expiryTime || expiryTime <= Date.now() + 60 * 1000;

  authClient.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
    expiry_date: expiryTime || undefined,
  });

  if (!expiresSoon) return authClient;

  if (!user.googleRefreshToken) {
    const error = new Error(
      "Google Calendar refresh token is missing. Please reconnect Google Calendar."
    );
    error.statusCode = 403;
    throw error;
  }

  const { credentials } = await authClient.refreshAccessToken();

  user.googleAccessToken = credentials.access_token || user.googleAccessToken;
  user.googleTokenExpiry = credentials.expiry_date
    ? new Date(credentials.expiry_date)
    : user.googleTokenExpiry;

  if (credentials.refresh_token) {
    user.googleRefreshToken = credentials.refresh_token;
  }

  await user.save();

  authClient.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
    expiry_date: user.googleTokenExpiry?.getTime(),
  });

  return authClient;
};

// ─── Error normaliser ─────────────────────────────────────────────────────────

const normalizeGoogleError = (error) => {
  // Always log the full Google error body so the exact failing field is visible.
  if (error.response?.data) {
    console.error(
      "[Google Calendar API Error]",
      JSON.stringify(error.response.data, null, 2)
    );
  }

  const rawStatus =
    error.statusCode || error.code || error.response?.status || 500;
  const status = Number.isInteger(Number(rawStatus)) ? Number(rawStatus) : 500;

  // Extract Google's field-level error array when present.
  const googleErrors = error.response?.data?.error?.errors;
  const fieldErrors = googleErrors
    ? googleErrors
        .map((e) => [e.location, e.message].filter(Boolean).join(": "))
        .join("; ")
    : null;

  const googleMessage =
    fieldErrors ||
    error.response?.data?.error_description ||
    error.response?.data?.error?.message ||
    error.errors?.[0]?.message ||
    error.message;

  if (status === 400) {
    return {
      status,
      message: `Google Calendar rejected the event payload. Details: ${googleMessage}`,
      error: googleMessage,
    };
  }

  if (status === 401) {
    return {
      status,
      message:
        "Google Calendar authorization expired. Please reconnect Google Calendar.",
      error: googleMessage,
    };
  }

  if (status === 403) {
    return {
      status,
      message:
        "Google Calendar permission was denied. Please reconnect and allow calendar access.",
      error: googleMessage,
    };
  }

  return {
    status,
    message: `Failed to add events to Google Calendar. Details: ${googleMessage}`,
    error: googleMessage,
  };
};

// ─── Route handlers ───────────────────────────────────────────────────────────

exports.googleAuth = async (req, res) => {
  try {
    const userId = req.user.id;

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [CALENDAR_SCOPE],
      state: userId,
    });

    return res.status(200).json({ success: true, url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate Google OAuth URL.",
      error: error.message,
    });
  }
};

exports.googleCallback = async (req, res) => {
  try {
    const code = req.query.code;
    const userId = req.query.state;

    if (!code || !userId) {
      return res.redirect(getFrontendRedirectUrl("failed"));
    }

    const { tokens } = await oauth2Client.getToken(code);
    const user = await User.findById(userId);

    if (!user) {
      return res.redirect(getFrontendRedirectUrl("failed"));
    }

    user.googleCalendarConnected = true;
    user.googleAccessToken = tokens.access_token || user.googleAccessToken || "";
    user.googleRefreshToken =
      tokens.refresh_token || user.googleRefreshToken || "";
    user.googleTokenExpiry = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : user.googleTokenExpiry;

    await user.save();
    await createCalendarNotification(userId, "connected");

    return res.redirect(getFrontendRedirectUrl("connected"));
  } catch (error) {
    console.error(error);
    return res.redirect(getFrontendRedirectUrl("failed"));
  }
};

exports.getCalendarStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "googleCalendarConnected googleAccessToken googleRefreshToken"
    );

    return res.status(200).json({
      success: true,
      connected: hasCalendarTokens(user),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Google Calendar status.",
      error: error.message,
    });
  }
};

exports.addDailyPlanToCalendar = async (req, res) => {
  const userId = req.user.id;

  try {
    const { plan } = req.body;

    if (!Array.isArray(plan) || plan.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No daily plan found.",
      });
    }

    const user = await User.findById(userId);

    if (!hasCalendarTokens(user)) {
      return res.status(400).json({
        success: false,
        message: "Google Calendar not connected.",
      });
    }

    const auth = await refreshAccessTokenIfNeeded(user);
    const calendar = google.calendar({ version: "v3", auth });
    const timeZone = user.timezone || "Asia/Kolkata";
    const today = getTodayInTimezone(timeZone);

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let firstEventLink = "";

    for (const task of plan) {
      const title = task.taskTitle || task.title;

      if (!title || !task.startTime || !task.endTime) {
        skippedCount += 1;
        continue;
      }

      const deadlineZeroId = getEventId(userId, today, task);
      const { start, end } = buildCalendarDateTimes(task, today, timeZone);

      // Build extendedProperties without any null/undefined values.
      // Google Calendar rejects null values in extendedProperties and returns
      // a generic HTTP 400 "Required" error — omit keys that have no value.
      const eventResource = {
        summary: title,
        description: task.reason || "Created from DeadlineZero AI Daily Plan.",
        start,
        end,
        extendedProperties: {
          private: sanitizeExtendedProperties({
            deadlineZeroId,
            source: "DeadlineZero",
            // deadlineZeroOriginalColorId is intentionally omitted here.
            // It is only written when a completed→pending restore is needed.
          }),
        },
      };

      // Validate the full payload locally before hitting the API.
      // This surfaces clear error messages instead of Google's generic "Required".
      validateEventPayload(eventResource, `[Task: "${title}"]`);

      const linkedTask = await Task.findOne({ user: userId, title }).sort({
        deadline: 1,
      });

      // ── Case 1: task already has a known calendar event ID → try to patch ──
      if (linkedTask?.calendarEventId) {
        try {
          const patchedEvent = await patchCalendarEvent({
            calendar,
            eventId: linkedTask.calendarEventId,
            resource: eventResource,
          });

          await saveCalendarEventOnTask(userId, title, patchedEvent.data);
          if (!firstEventLink && patchedEvent.data?.htmlLink) {
            firstEventLink = patchedEvent.data.htmlLink;
          }
          updatedCount += 1;
          continue;
        } catch (error) {
          const status =
            error.statusCode || error.code || error.response?.status;
          // 404 / 410 means the event was deleted on Google's side — fall
          // through to create a fresh one. Re-throw anything else.
          if (Number(status) !== 404 && Number(status) !== 410) {
            throw error;
          }
          linkedTask.calendarEventId = null;
          linkedTask.calendarEventLink = "";
          await linkedTask.save();
        }
      }

      // ── Case 2: look up by our stable deadlineZeroId fingerprint ──────────
      const existingEvents = await calendar.events.list({
        calendarId: "primary",
        privateExtendedProperty: [`deadlineZeroId=${deadlineZeroId}`],
        maxResults: 1,
        singleEvents: true,
      });

      if (existingEvents.data.items?.length) {
        const existingEvent = existingEvents.data.items[0];

        await saveCalendarEventOnTask(userId, title, existingEvent);
        if (!firstEventLink && existingEvent.htmlLink) {
          firstEventLink = existingEvent.htmlLink;
        }
        skippedCount += 1;
        continue;
      }

      // ── Case 3: no existing event found → create ───────────────────────────
      const insertedEvent = await calendar.events.insert({
        calendarId: "primary",
        requestBody: eventResource,
      });

      if (!firstEventLink && insertedEvent.data?.htmlLink) {
        firstEventLink = insertedEvent.data.htmlLink;
      }

      await saveCalendarEventOnTask(userId, title, insertedEvent.data);
      createdCount += 1;
    }

    await markUserPlanSynced(userId);
    await createCalendarNotification(userId, "synced", {
      createdCount,
      updatedCount,
      skippedCount,
      calendarLink: firstEventLink,
    });

    return res.status(200).json({
      success: true,
      message:
        createdCount > 0
          ? "Daily plan added to Google Calendar."
          : updatedCount > 0
          ? "Google Calendar updated with today's latest plan."
          : "Today's plan is already synced to Google Calendar.",
      createdCount,
      updatedCount,
      skippedCount,
      planSyncedToCalendar: true,
    });
  } catch (error) {
    console.error(error);

    const normalized = normalizeGoogleError(error);
    await createCalendarNotification(userId, "sync-failed", {
      error: normalized.message,
    });

    return res.status(normalized.status).json({
      success: false,
      message: normalized.message,
      error: normalized.error,
    });
  }
};