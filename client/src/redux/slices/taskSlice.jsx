import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
  stats: null,
  loading: false,
  dailyPlan: null,
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

    clearTasks: (state) => {
      state.tasks = [];
      state.stats = null;
    },
    setDailyPlan: (state, action) => {
    state.dailyPlan = action.payload;
      },
  },
});

export const {
  setTasks,
  setStats,
  setLoading,
  clearTasks,
  setDailyPlan,
} = taskSlice.actions;

export default taskSlice.reducer;