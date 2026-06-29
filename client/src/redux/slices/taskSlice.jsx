import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
  stats: null,
  loading: false,
  dailyPlan: null,
  plannerLoading: false,
  analytics: null,
  planGeneratedDate: null,
  lastPlanGenerated: null,
  planOutdated: false,
  calendarConnected: false,
  calendarStatusLoading: false,
  calendarConnecting: false,
  calendarSyncing: false,
  calendarSynced: false,
};

const taskSlice = createSlice({
  name: "task",
  initialState,

  reducers: {
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },

    setStats: (state, action) => {
      state.stats = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPlannerLoading: (state, action) => {
      state.plannerLoading = action.payload;
    },

    clearTasks: (state) => {
      state.tasks = [];
      state.stats = null;
    },
    setDailyPlan: (state, action) => {
      const payload = action.payload;

      if (payload && Object.prototype.hasOwnProperty.call(payload, "dailyPlan")) {
        state.dailyPlan = payload.dailyPlan;
        state.planGeneratedDate = payload.planGeneratedDate || null;
        state.lastPlanGenerated = payload.lastPlanGenerated || null;
        state.planOutdated = Boolean(payload.planOutdated);
        state.calendarSynced = Boolean(payload.planSyncedToCalendar);
      } else {
        state.dailyPlan = payload;
        state.planOutdated = false;
        state.calendarSynced = false;
      }
    },
    clearDailyPlan: (state) => {
      state.dailyPlan = null;
      state.planGeneratedDate = null;
      state.lastPlanGenerated = null;
      state.planOutdated = false;
      state.calendarSynced = false;
    },
    setAnalytics: (state, action) => {
       state.analytics = action.payload;
      },
    setCalendarConnected: (state, action) => {
      state.calendarConnected = action.payload;
    },
    setCalendarStatusLoading: (state, action) => {
      state.calendarStatusLoading = action.payload;
    },
    setCalendarConnecting: (state, action) => {
      state.calendarConnecting = action.payload;
    },
    setCalendarSyncing: (state, action) => {
      state.calendarSyncing = action.payload;
    },
    setCalendarSynced: (state, action) => {
      state.calendarSynced = action.payload;
    },
    setPlanOutdated: (state, action) => {
      state.planOutdated = Boolean(action.payload && state.dailyPlan);
      if (state.planOutdated) {
        state.calendarSynced = false;
      }
    },
  },
});

export const {
  setTasks,
  setStats,
  setLoading,
  clearTasks,
  setDailyPlan,
  clearDailyPlan,
  setPlannerLoading,
  setAnalytics,
  setCalendarConnected,
  setCalendarStatusLoading,
  setCalendarConnecting,
  setCalendarSyncing,
  setCalendarSynced,
  setPlanOutdated

} = taskSlice.actions;

export default taskSlice.reducer;
