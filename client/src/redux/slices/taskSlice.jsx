import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tasks: [],
  stats: null,
  loading: false,
  dailyPlan: null,
  plannerLoading: false,
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
  setPlannerLoading

} = taskSlice.actions;

export default taskSlice.reducer;