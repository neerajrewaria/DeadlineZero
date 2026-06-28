import { apiConnector } from "../apiconnector";
import { toast } from "react-hot-toast";
import { setStats, setLoading,setTasks } from "../../redux/slices/taskSlice";
import { ai,task } from "../apis";
import { setDailyPlan } from "../../redux/slices/taskSlice";

export const getDashboardStats = (token) => {
  return async (dispatch) => {

    dispatch(setLoading(true));

    try {
      const response = await apiConnector(
        "GET",
        task.GET_DASHBOARD_STATS,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        dispatch(setStats(response.data.stats));
      } else {
        toast.error("Unable to fetch dashboard stats");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch dashboard stats");
    }

    dispatch(setLoading(false));
  };
};




export const getAllTasks = (token) => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const response = await apiConnector(
        "GET",
        task.GET_ALL_TASKS,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        dispatch(setTasks(response.data.tasks));
      } else {
        toast.error("Unable to fetch tasks");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch tasks");
    }

    dispatch(setLoading(false));
  };
};


export const completeTask = (taskId, token) => {
  return async (dispatch) => {

    const confirmed = window.confirm(
      "Are you sure you have completed this task?"
    );

    if (!confirmed) {
      return;
    }

    dispatch(setLoading(true));

    try {

      const response = await apiConnector(
        "PATCH",
        `${task.COMPLETE_TASK}/${taskId}/complete`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {

        toast.success(response.data.message);

        // Refresh Redux state
        dispatch(getAllTasks(token));
        dispatch(getDashboardStats(token));

      } else {

        toast.error("Unable to complete task");

      }

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to complete task"
      );

    }

    dispatch(setLoading(false));

  };
};




export const createTaskWithAI = (prompt, token) => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const response = await apiConnector(
        "POST",
        ai.CREATE_TASK_AI,
        { prompt },
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {

        toast.success(response.data.message);

        dispatch(getAllTasks(token));

        dispatch(getDashboardStats(token));

      } else {

        toast.error(response.data.message);

      }

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to generate tasks."
      );

    }

    dispatch(setLoading(false));
  };
};


export const getDailyPlan = (token) => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {

      const response = await apiConnector(
        "GET",
        ai.DAILY_PLAN,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {

        dispatch(setDailyPlan(response.data.dailyPlan));

      } else {

        toast.error(response.data.message);

      }

    } catch (error) {

      console.log(error);

      toast.error("Failed to generate daily plan.");

    }

    dispatch(setLoading(false));
  };
};