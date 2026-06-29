- [ ] Fix AI Daily Plan regeneration flow to guarantee fresh MongoDB query + complete replacement.
- [ ] Add/adjust backend endpoint to generate updated plan and overwrite today’s stored plan atomically.
- [ ] Ensure client’s "Generate Updated Plan" dispatch calls that generation endpoint (not only stored-plan retrieval).
- [ ] After generation, immediately fetch stored plan (or return generated plan and update Redux) so DailyPlan renders without refresh.
- [ ] Ensure backend task filtering & deterministic ordering: active/pending only, sort by priority (high→medium→low), then deadline, then createdAt.
- [ ] Prevent planner merging: never reuse prior dailyPlan JSON in regeneration.
- [ ] Verify Insights and Planner use same task dataset (both derived from latest generated plan).
- [ ] Run lint/tests/build if available.

