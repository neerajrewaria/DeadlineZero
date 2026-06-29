Plan to fix stale-data bug in AI Planner

Information gathered
- Backend has AI generator endpoint: GET /api/v1/ai/daily-plan -> controllers/aiController.getDailyPlan
  - Queries MongoDB for pending tasks: Task.find({ user: userId, status: 'pending' }).sort({ deadline: 1 })
  - Calls Gemini: generateDailyPlan(tasks, user)
  - Overwrites today’s stored plan via saveTodayPlan(user, dailyPlan)
- Backend stored planner endpoint: GET /api/v1/tasks/daily-plan -> controllers/taskController.getStoredDailyPlan
  - Returns User.dailyPlan for today if planGeneratedDate matches timezone-derived date key
- Frontend DailyPlan component calls dispatch(getDailyPlan(token)) when user clicks Generate Updated Plan
  - In DailyPlan.jsx, both initial and updated generation actions call getDailyPlan(token)
- Frontend Redux thunk getDailyPlan(token) calls ai.DAILY_PLAN (fresh generation)
  - client/src/services/operations/taskAPI.js getDailyPlan does GET ai.DAILY_PLAN

Identified risk
- Despite calling generation, planner still appears stale in practice, implying either:
  - endpoint mismatch (button not calling the thunk you think), or
  - planOutdated logic causes UI to render stored plan from a previous state, or
  - regeneration is not truly “fresh” because tasks ordering/filtering differs between Insights and prompt, or prompt omits/doesn’t prioritize the new high-priority task due to insufficient ordering inputs.

Required changes
1) Enforce backend deterministic task ordering and include all active pending tasks
   - In aiController.getDailyPlan: sort by priority (high->medium->low), then deadline asc, then createdAt asc
2) Enforce prompt construction from exactly the same task list used for Insights
   - In geminiService.generateDailyPlan: include tasks with their title/priority/deadline exactly as received.
3) Enforce frontend “hard refresh” behavior on regeneration
   - In DailyPlan.jsx, before requesting generation, clear dailyPlan and planOutdated in Redux so old UI cannot render while waiting.
4) Ensure backend hard overwrite and never merge
   - In saveTodayPlan (utils/dailyPlan.js) already overwrites dailyPlan/user.dailyPlan.
   - Add extra guard: always set user.dailyPlan = null before save/overwrite when generating.
5) Add a dedicated endpoint for regeneration
   - POST /api/v1/ai/daily-plan/regenerate that:
     - refetches tasks from MongoDB
     - generates new JSON
     - overwrites dailyPlan
     - returns the generated plan (so frontend doesn’t depend on stored-plan retrieval)

Files to modify
- server/src/controllers/aiController.js
- server/src/services/geminiService.js
- server/src/utils/dailyPlan.js
- server/src/routes/aiRoutes.js
- client/src/services/operations/taskAPI.js
- client/src/redux/slices/taskSlice.jsx
- client/src/components/dashboard/DailyPlan.jsx

