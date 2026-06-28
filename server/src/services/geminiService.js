const { GoogleGenAI } = require("@google/genai");

// Create Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Generate structured tasks from user's natural language prompt
const generateTaskFromPrompt = async (userPrompt) => {
  try {
    // Get today's date (used by Gemini to understand "today", "tomorrow", etc.)
    const today = new Date().toISOString().split("T")[0];

    // Prompt sent to Gemini
    const prompt = `
You are an AI Productivity Assistant.

Your job is to analyze the user's prompt and extract one or more tasks.

Today's Date: ${today}

When the user says:
- today
- tomorrow
- next Monday
- Friday
- next week

always calculate the actual date relative to Today's Date.

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
- Return deadline in YYYY-MM-DD format.
- Never return "tomorrow" or "Friday".

Priority Rules:
- Must be one of:
  - low
  - medium
  - high

Category Rules:
- Must be one of:
  - academic
  - career
  - personal
  - health
  - finance
  - general

Return exactly in this format:

{
  "tasks": [
    {
      "title": "",
      "description": "",
      "deadline": "",
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

    // Send prompt to Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Extract Gemini response
    const text = response.text;

    // Remove markdown if Gemini accidentally returns it
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Debugging
    console.log("\n========== GEMINI RESPONSE ==========\n");
    console.log(cleanedText);
    console.log("\n=====================================\n");

    // Convert JSON string into JavaScript object
    const parsedResponse = JSON.parse(cleanedText);

    return parsedResponse;

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};



// ==========================================
// Generate AI Daily Plan
// ==========================================
const generateDailyPlan = async (tasks, user) => {
  try {

    // Today's date
    const today = new Date().toISOString().split("T")[0];

    // Convert tasks into readable text for Gemini
    const taskList = tasks
      .map((task, index) => {
        return `
Task ${index + 1}

Title: ${task.title}
Description: ${task.description}
Deadline: ${task.deadline}
Priority: ${task.priority}
Estimated Hours: ${task.estimatedHours}
Category: ${task.category}
`;
      })
      .join("\n");

    // Prompt for Gemini
    const prompt = `
You are an expert AI Productivity Coach.
Create an intelligent daily schedule.

Scheduling Rules:
- Schedule the highest priority and nearest deadline tasks first.
- Allocate realistic continuous work blocks.
- Do NOT split tasks unnecessarily.
- Only split a task if it requires more than 3 hours of continuous work.
- Minimize context switching between different tasks.
- Leave a 15-minute break between long work sessions.
- Keep the schedule within the user's working hours.
- If all tasks cannot fit today, schedule the most important ones first.


Planning Rules:

- Include as many important tasks as can realistically fit into today's working hours.
- Do not focus on only one task if multiple high-priority tasks can be scheduled.
- If a task cannot be completed today, schedule as much meaningful progress as possible and continue with the next important task if time remains.

Today's Date:
${today}

IMPORTANT::

Always generate today's schedule.
If the current time is late in the day, assume planning starts from the user's next available work session.
Never return an empty plan unless there are absolutely no pending tasks.


User Preferences

Work Start Hour: ${user.workStartHour}:00

Work End Hour: ${user.workEndHour}:00



Preferred Work Time:
${user.preferredWorkTime}

Current 
${new Date().toLocaleTimeString()}

Pending Tasks

${taskList}

Your job is to create the best schedule for today.

Rules:

- Return ONLY valid JSON.
- Do NOT use markdown.
- Do NOT explain anything.
- Do NOT use \`\`\`.

Return exactly like this:


{
  "summary": "",

  "plan": [
    {
      "startTime": "",
      "endTime": "",
      "taskTitle": "",
      "priority": "",
      "reason": ""
    }
  ]
}

Summary Rules:

- Write a short motivational summary (1-2 sentences).
- Mention today's main focus.
- Mention the most important task.
-If today's working hours have already passed, create the schedule for the user's next working day.
Never return an empty "plan" when pending tasks exist.
`;

    // Ask Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Extract response
    const text = response.text;

    // Remove markdown if returned
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
  generateTaskFromPrompt,generateDailyPlan
};