const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_DEADLINE_TIME = "09:00";

// Keywords that mark a task as a hard deadline (Level 1 — never postpone).
// Used to annotate tasks before sending them to Gemini so the model has an
// explicit signal rather than having to infer it from free text.
const HARD_DEADLINE_KEYWORDS = [
  "flight", "flights", "airport", "depart", "departure",
  "interview", "interviews",
  "exam", "exams", "test", "quiz",
  "meeting", "call", "standup", "sync",
  "doctor", "appointment", "clinic", "hospital",
  "fee", "fees", "payment", "bill", "bills", "due",
  "submission", "submit", "deadline", "present", "presentation",
  "ceremony", "event", "ceremony", "wedding", "funeral",
  "court", "visa", "passport",
];

// Keywords that mark a task as a long-term / learning task (Level 7 — fill gaps).
const LEARNING_KEYWORDS = [
  "dsa", "leetcode", "coding practice", "react", "angular", "vue",
  "gym", "workout", "exercise", "run", "jog",
  "read", "reading", "book", "course", "learn", "learning",
  "portfolio", "side project", "blog",
];

// ─── Deadline builder (unchanged — critical timezone fix) ─────────────────────

/**
 * Combine a YYYY-MM-DD date and HH:MM time into a UTC Date object,
 * interpreting the wall-clock time in the user's timezone.
 */
const buildDeadline = (dateStr, timeStr, timeZone = "Asia/Kolkata") => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    dateStr = new Date().toISOString().slice(0, 10);
  }

  const time =
    timeStr && /^\d{1,2}:\d{2}$/.test(timeStr.trim())
      ? timeStr.trim()
      : DEFAULT_DEADLINE_TIME;

  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  const naiveUTC = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(naiveUTC).map(({ type, value }) => [type, value])
  );

  const localHour = Number(parts.hour === "24" ? 0 : parts.hour);
  const localMinute = Number(parts.minute);
  const localDay = Number(parts.day);

  const hourDiff = hour - localHour;
  const minuteDiff = minute - localMinute;
  const dayDiff = day - localDay;

  const correctedMs =
    naiveUTC.getTime() +
    (dayDiff * 24 * 60 + hourDiff * 60 + minuteDiff) * 60 * 1000;

  return new Date(correctedMs);
};

// ─── Task classification helpers ─────────────────────────────────────────────

/**
 * Returns true if the task title/description contains any hard-deadline keyword.
 * This gives Gemini an explicit "HARD_DEADLINE: true" flag so it never buries
 * a flight or exam under learning tasks.
 */
const isHardDeadline = (task) => {
  const haystack = `${task.title} ${task.description || ""}`.toLowerCase();
  return HARD_DEADLINE_KEYWORDS.some((kw) => haystack.includes(kw));
};

/**
 * Returns true if the task is a long-term learning / habit task (Level 7).
 */
const isLearningTask = (task) => {
  const haystack = `${task.title} ${task.description || ""}`.toLowerCase();
  return LEARNING_KEYWORDS.some((kw) => haystack.includes(kw));
};

/**
 * Returns how many minutes from now the deadline is.
 * Negative = already overdue.
 */
const minutesUntilDeadline = (task) => {
  return Math.round((new Date(task.deadline) - Date.now()) / 60000);
};

/**
 * Returns how many full calendar days remain until the deadline.
 * Day 0 = due today, Day 1 = due tomorrow, etc.
 * Negative = overdue.
 */
const daysUntilDeadline = (task) => {
  const minsLeft = minutesUntilDeadline(task);
  return Math.floor(minsLeft / (60 * 24));
};

/**
 * How many hours the user should work on this task TODAY to finish on time,
 * assuming equal daily distribution across remaining days.
 *
 * Examples:
 *   estimatedHours=6, daysLeft=3  → 2h/day → must do 2h today
 *   estimatedHours=8, daysLeft=1  → 8h today (tight!)
 *   estimatedHours=2, daysLeft=7  → 0.3h/day → low urgency
 *
 * Returns 0 if the task is already overdue (handled separately).
 */
const dailyHoursNeeded = (task) => {
  const days = daysUntilDeadline(task);
  if (days <= 0) return 0; // overdue — escalated separately
  const h = Number(task.estimatedHours) || 1;
  return Math.ceil((h / days) * 10) / 10; // round up to 1 decimal
};

/**
 * Returns true if a future task is "prep-urgent" — meaning it has enough
 * estimated work that skipping today would make it impossible to finish on time.
 *
 * Rule: if dailyHoursNeeded >= 1.5h AND deadline is within 5 days,
 * treat it like a high-priority today task (URGENCY_LEVEL 3.5, shown as 4).
 */
const isPrepUrgent = (task) => {
  const days = daysUntilDeadline(task);
  if (days <= 0 || days > 5) return false; // overdue or far away — not this logic
  return dailyHoursNeeded(task) >= 1.5;
};

/**
 * Format a task's deadline as a human-readable local string so Gemini
 * can reason about "2 hours from now" vs "next week" without timezone confusion.
 */
const formatDeadlineLocal = (task, timeZone) => {
  return new Date(task.deadline).toLocaleString("en-IN", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// ─── Task enrichment for planner prompt ──────────────────────────────────────

/**
 * Convert the raw task array into an annotated block that Gemini can parse
 * without having to infer urgency from vague deadline strings.
 *
 * Each task gets:
 *   URGENCY_LEVEL   — 1 (hard deadline) … 7 (learning)
 *   OVERDUE         — true/false
 *   MINUTES_LEFT    — numeric (negative if overdue)
 *   DEADLINE_LOCAL  — human-readable local time string
 *
 * This replaces the old plain-text task list which gave Gemini no urgency signal.
 */
const buildAnnotatedTaskList = (tasks, timeZone) => {
  return tasks
    .map((task, index) => {
      const minsLeft = minutesUntilDeadline(task);
      const days = daysUntilDeadline(task);
      const overdue = minsLeft < 0;
      const hard = isHardDeadline(task);
      const learning = isLearningTask(task);
      const prepUrgent = isPrepUrgent(task);
      const dailyHrs = dailyHoursNeeded(task);

      // ── Urgency level assignment ──────────────────────────────────────────
      // The key addition: isPrepUrgent() promotes future tasks to Level 3
      // when daily_hours_needed >= 1.5h and deadline is within 5 days.
      // Without this, "React interview prep (6h, 3 days away)" would sit at
      // Level 4/5 and get skipped whenever today has any other work.
      let urgencyLevel;
      if (hard) urgencyLevel = 1;
      else if (overdue) urgencyLevel = 2;
      else if (minsLeft < 24 * 60) urgencyLevel = 3;   // due today
      else if (prepUrgent) urgencyLevel = 3;            // prep-urgent: treat as due today
      else if (task.priority === "high") urgencyLevel = 4;
      else if (task.priority === "medium") urgencyLevel = 5;
      else if (learning) urgencyLevel = 7;
      else urgencyLevel = 6;

      // Human-readable prep pressure description injected into the prompt
      // so Gemini understands the math, not just the number.
      const prepPressureNote = prepUrgent
        ? `PREP_URGENT: true — ${dailyHrs}h needed today to finish on time (${days} day(s) left, ${task.estimatedHours}h total)`
        : days > 0
        ? `PREP_URGENT: false — ${dailyHrs}h/day needed (${days} day(s) left, ${task.estimatedHours}h total)`
        : `PREP_URGENT: false — overdue or due today`;

      return `
--- Task ${index + 1} ---
Title: ${task.title}
Description: ${task.description || "(none)"}
Deadline (local): ${formatDeadlineLocal(task, timeZone)}
Estimated Hours: ${task.estimatedHours || 1}
Priority: ${task.priority}
Category: ${task.category}
URGENCY_LEVEL: ${urgencyLevel}  (1=Hard deadline, 2=Overdue, 3=Due today/Prep-urgent, 4=High, 5=Medium, 6=Low, 7=Learning)
OVERDUE: ${overdue}
DAYS_LEFT: ${days}
MINUTES_LEFT: ${minsLeft}
HARD_DEADLINE: ${hard}
${prepPressureNote}
`.trim();
    })
    .join("\n\n");
};

// ─── Splitting formula ────────────────────────────────────────────────────────

/**
 * Return the splitting instruction string for a given task duration.
 * This is injected into the prompt so Gemini gets an exact rule, not a vague hint.
 *
 * <=2 h  → schedule once, no split
 *  3 h   → 1.5 h + break + 1.5 h
 *  4 h   → 2 h + break + 2 h
 * >=5 h  → 2 h + break + 2 h + lunch/break + remainder
 */
const splittingRule = (estimatedHours) => {
  const h = Number(estimatedHours) || 1;
  if (h <= 2) return `Schedule once as a single block of ${h} hour(s). Do NOT split.`;
  if (h <= 3) return `Split into two blocks: ${Math.ceil(h / 2)}h → 15-min break → ${Math.floor(h / 2)}h. Label them "Part 1" and "Part 2".`;
  if (h <= 4) return `Split into two blocks: 2h → 15-min break → 2h. Label them "Part 1" and "Part 2".`;
  return `Split into three blocks: 2h → 15-min break → 2h → 30-min lunch/break → ${h - 4}h. Label them "Part 1", "Part 2", "Part 3 / Wrap-up".`;
};

// ─── Task generation ──────────────────────────────────────────────────────────

const generateTaskFromPrompt = async (userPrompt, timeZone = "Asia/Kolkata") => {
  try {
    const now = new Date();
    const todayDate = now.toLocaleDateString("en-CA", { timeZone });
    const currentTime = now.toLocaleTimeString("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const prompt = `
You are an AI Productivity Assistant.

Your job is to analyze the user's prompt and extract one or more tasks.

Today's Date: ${todayDate}
Current Time: ${currentTime} (use this to resolve relative times like "in 3 hours" or "this evening")

When the user says relative dates (today, tomorrow, next Monday, Friday, next week),
always calculate the actual calendar date relative to Today's Date above.

When the user says relative times (in 3 hours, this evening, tonight, this afternoon),
always calculate the actual HH:MM time relative to Current Time above.

Estimated Hours Rules:
- Return only an integer.
- Estimate realistically based on the complexity of the task.
- Academic assignments: usually 2–8 hours.
- Coding interviews: usually 2–6 hours.
- Meetings: 1 hour.
- Personal tasks: 1–3 hours.

IMPORTANT RULES:
1. Return ONLY valid JSON.
2. Do NOT return markdown.
3. Do NOT use \`\`\`json.
4. Do NOT explain anything.
5. Return ONLY the JSON object.

Deadline Rules:
- Return "deadlineDate" as YYYY-MM-DD (the calendar date of the deadline).
- Return "deadlineTime" as HH:MM in 24-hour format (the time of the deadline).
  - If the user explicitly states a time (e.g. "8:40 PM", "14:00", "noon", "midnight",
    "in 3 hours", "this evening"), extract and convert it to HH:MM 24-hour.
  - If NO time is mentioned at all, return "deadlineTime": "" (empty string).
- NEVER collapse date + time into a single field.
- NEVER return "tomorrow", "Friday", or any relative word as a value.

Priority Rules:
- Must be exactly one of: low | medium | high

Category Rules:
- Must be exactly one of: academic | career | personal | health | finance | general

Return exactly in this JSON format (no extra fields, no markdown):

{
  "tasks": [
    {
      "title": "",
      "description": "",
      "deadlineDate": "YYYY-MM-DD",
      "deadlineTime": "HH:MM",
      "priority": "",
      "estimatedHours": 0,
      "category": "",
      "aiSummary": "",
      "aiReasoning": "",
      "aiSuggestions": []
    }
  ]
}

User Prompt:
${userPrompt}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("\n========== GEMINI RESPONSE ==========\n");
    console.log(cleanedText);
    console.log("\n=====================================\n");

    const parsedResponse = JSON.parse(cleanedText);

    parsedResponse.tasks = parsedResponse.tasks.map((task) => {
      const deadline = buildDeadline(task.deadlineDate, task.deadlineTime, timeZone);

      console.log(
        `[deadline] "${task.title}" | date=${task.deadlineDate} time=${
          task.deadlineTime || `(none→${DEFAULT_DEADLINE_TIME})`
        } → ${deadline.toISOString()}`
      );

      const { deadlineDate, deadlineTime, ...rest } = task;
      return { ...rest, deadline };
    });

    return parsedResponse;
  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};

// ─── Daily plan generation ────────────────────────────────────────────────────

const generateDailyPlan = async (tasks, user) => {
  try {
    const timeZone = user.timezone || "Asia/Kolkata";
    const now = new Date();

    const todayDate = now.toLocaleDateString("en-CA", { timeZone });
    const currentTime = now.toLocaleTimeString("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // ── Build annotated task list (the key upgrade over the old plain-text list)
    const annotatedTaskList = buildAnnotatedTaskList(tasks, timeZone);

    // ── Build per-task splitting rules so Gemini gets exact formulas
    const splittingGuide = tasks
      .map((t, i) =>
        `Task ${i + 1} "${t.title}" (${t.estimatedHours}h): ${splittingRule(t.estimatedHours)}`
      )
      .join("\n");

    // ── Aggregate stats for scoring context
    const totalPendingTasks = tasks.length;
    const hardDeadlineTasks = tasks.filter(isHardDeadline).length;
    const overdueTasks = tasks.filter((t) => minutesUntilDeadline(t) < 0).length;
    const dueTodayTasks = tasks.filter(
      (t) => minutesUntilDeadline(t) >= 0 && minutesUntilDeadline(t) < 24 * 60
    ).length;
    const prepUrgentTasks = tasks.filter(isPrepUrgent);
    const highPriorityTasks = tasks.filter((t) => t.priority === "high").length;
    const totalEstimatedHours = tasks.reduce(
      (sum, t) => sum + (Number(t.estimatedHours) || 0),
      0
    );
    const availableWorkMinutes =
      (user.workEndHour - user.workStartHour) * 60;

    // Build a human-readable prep pressure summary for the prompt header
    const prepUrgentSummary =
      prepUrgentTasks.length > 0
        ? prepUrgentTasks
            .map(
              (t) =>
                `  • "${t.title}" — ${dailyHoursNeeded(t)}h needed today (${daysUntilDeadline(t)} day(s) left, ${t.estimatedHours}h total)`
            )
            .join("\n")
        : "  (none)";

    const prompt = `
You are an expert AI Productivity Scheduler — think of yourself as a calm, senior executive assistant who has seen every kind of deadline crisis and knows exactly how to protect what matters most.

====== CONTEXT ======

Today's Date: ${todayDate}
Current Time: ${currentTime}
User's Work Window: ${user.workStartHour}:00 – ${user.workEndHour}:00 (${availableWorkMinutes} minutes available)
Preferred Work Time: ${user.preferredWorkTime}
Total Pending Tasks: ${totalPendingTasks}
Hard Deadlines Today: ${hardDeadlineTasks}
Overdue Tasks: ${overdueTasks}
Due Today: ${dueTodayTasks}
High Priority: ${highPriorityTasks}
Total Estimated Work: ${totalEstimatedHours} hours

PREP-URGENT TASKS (future deadlines that require work starting TODAY):
${prepUrgentSummary}

====== ANNOTATED TASK LIST ======

${annotatedTaskList}

====== MANDATORY SCHEDULING ORDER ======

You MUST schedule tasks in this exact priority order. Do not deviate.

LEVEL 1 — HARD_DEADLINE: true tasks come FIRST, always.
  These include flights, interviews, exams, meetings, doctor appointments, fee payments, submissions.
  They CANNOT be postponed or buried under other tasks.
  If a hard deadline task has a specific time (e.g. flight at 8:40 PM), schedule all preparation
  tasks (packing, travel to airport, check-in) BEFORE it, not learning tasks.

LEVEL 2 — OVERDUE: true tasks. Schedule immediately at work start.

LEVEL 3 — Tasks due TODAY (MINUTES_LEFT < 1440 and not overdue).

LEVEL 3 also includes PREP_URGENT: true tasks.
  These are future-deadline tasks where skipping today makes completion IMPOSSIBLE.
  Example: React interview prep (6h total, 3 days left) → must do 2h today.
  The PREP_URGENT annotation already tells you exactly how many hours to schedule today.
  Schedule AT LEAST the PREP_URGENT daily hours for each such task.
  Do NOT skip these just because the deadline is not today.
  Treat them with the same urgency as a task due today.

LEVEL 4 — High priority tasks not yet covered above.

LEVEL 5 — Medium priority tasks.

LEVEL 6 — Low priority tasks.

LEVEL 7 — Learning/habit tasks (DSA, gym, reading, React, portfolio).
  Schedule ONLY into remaining free time after Levels 1–6 are handled.
  If no time remains, omit them and note this in insights.

====== TASK SPLITTING RULES ======

Follow these rules exactly. Do NOT invent your own splitting logic.

${splittingGuide}

When splitting a task into parts, label each part clearly:
  "DSA Sheet — Part 1", "DSA Sheet — Part 2", "DSA Sheet — Revision"
  Never produce four cards with identical titles.
Each part must have a distinct reason field explaining what will be accomplished.

====== BREAK RULES ======

- Insert a 15-minute break between sessions longer than 90 minutes.
- Insert a 30-minute lunch break if the schedule spans more than 4 hours.
- Do NOT insert breaks between short tasks (<= 1 hour).
- Break blocks must have "taskType": "break".
- Never schedule more break time than focus time.

====== HARD CONSTRAINTS ======

1. Never schedule a task outside the user's work window (${user.workStartHour}:00 – ${user.workEndHour}:00).
2. If current time is past work end hour, move all lower-priority tasks to tomorrow and say so in insights.
3. Never schedule the same task title consecutively without a break or different task between them.
4. If a hard deadline task has a known time (found in its description), nothing else is scheduled at that time.
5. Every task block must have a non-empty "reason" field explaining WHY it is placed at that time.

====== PRODUCTIVITY SCORE FORMULA ======

Calculate productivityScore (0–100) from the generated schedule only, using this rubric:

  Hard deadline coverage: up to 30 points  (all hard deadlines scheduled → 30)
  Overdue task coverage:  up to 20 points  (all overdue tasks scheduled → 20)
  Priority alignment:     up to 20 points  (higher URGENCY_LEVEL tasks scheduled before lower ones → 20)
  Work-time utilization:  up to 15 points  (scheduled focus minutes / available minutes, capped at 85% → 15)
  Break balance:          up to 10 points  (≥1 break per 2h focus → 10)
  Context-switch penalty: up to -5 points  (deduct 1 point per unnecessary context switch between unrelated categories)

Sum the points and return the total as productivityScore.

====== OUTPUT FORMAT ======

Return ONLY valid JSON. No markdown. No explanation. No \`\`\`.

{
  "summary": "",
  "focusTitle": "",
  "confidence": 0,
  "productivityScore": 0,
  "estimatedFocusTime": 0,
  "estimatedBreakTime": 0,
  "insights": ["", "", ""],
  "plan": [
    {
      "startTime": "",
      "endTime": "",
      "taskTitle": "",
      "taskType": "work",
      "priority": "",
      "reason": ""
    }
  ]
}

====== FIELD RULES ======

summary:
  Exactly 2–3 sentences. No filler phrases like "Let's make today great!"
  Mention: the most urgent task and why it must go first, total workload vs available time,
  and what has been deferred if anything.
  Example: "Your flight preparation takes absolute priority — packing and travel must complete before 7 PM. Two assignments and a fee payment follow in the remaining window. DSA practice has been moved to tomorrow as no time remains."

focusTitle:
  A short professional phrase (3–5 words). Examples: "Deadline Recovery Sprint", "Interview Prep Day",
  "Assignment Completion Push", "Placement Focus Session", "Deep Work Block".

confidence:
  Integer 75–99. Reflect how feasible the schedule is given available time vs total workload.
  If total estimated work > available time, confidence should be lower (75–82).
  If all tasks fit comfortably, confidence can reach 90–99.

productivityScore:
  Calculate using the rubric above. Must match what the schedule actually contains.

estimatedFocusTime:
  Total minutes across all "taskType": "work" blocks.

estimatedBreakTime:
  Total minutes across all "taskType": "break" blocks.

insights:
  Exactly 3–5 items. Maximum 2 lines each. Actionable, specific, never generic.
  Lead with an emoji from: ✓ ⚠ 🕐 📌 💡
  Bad:  "Make sure to take regular breaks to avoid burnout."
  Good: "⚠ College fee deadline is today — pay before 5 PM or face a late penalty."
  Good: "🕐 Flight at 8:40 PM — leave home by 6:30 PM to allow airport buffer time."
  Good: "📌 DSA has been deferred to tomorrow; 2h morning slot recommended."

plan:
  startTime / endTime: "HH:MM" 24-hour format.
  taskTitle: exact task title + part label if split (e.g. "React Course — Part 2").
  taskType: "work" | "break".
  priority: task's priority string, or "break" for break blocks.
  reason: 1 sentence explaining why this task is here at this time. Never empty.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    console.log("\n===== DAILY PLAN =====\n");
    console.log(cleanedText);
    console.log("\n======================\n");

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Daily Planner Error:", error);
    throw error;
  }
};

module.exports = {
  generateTaskFromPrompt,
  generateDailyPlan,
};