import { apiConnector } from "../apiconnector";
import { toast } from "react-hot-toast";
import { setStats, setLoading, setTasks } from "../../redux/slices/taskSlice";
import { ai, task } from "../apis";
import {
  setDailyPlan,
  clearDailyPlan,
  setPlannerLoading,
  setAnalytics,
  setCalendarConnected,
  setCalendarStatusLoading,
  setCalendarConnecting,
  setCalendarSyncing,
  setCalendarSynced,
  setPlanOutdated,
} from "../../redux/slices/taskSlice";

import { analytics, calendar } from "../apis";

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
        if (response.data.calendarWarning) {
          toast.error(response.data.calendarWarning);
        }
        dispatch(setPlanOutdated(true));

        // Refresh Redux state
        await Promise.all([
          dispatch(getAllTasks(token)),
          dispatch(getDashboardStats(token)),
        ]);

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

export const createTask = (taskData, token) => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const response = await apiConnector(
        "POST",
        task.GET_ALL_TASKS,
        taskData,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(setPlanOutdated(true));
        await Promise.all([
          dispatch(getAllTasks(token)),
          dispatch(getDashboardStats(token)),
        ]);
      } else {
        toast.error(response.data.message || "Unable to create task");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
        "Failed to create task"
      );
    }

    dispatch(setLoading(false));
  };
};

export const updateTask = (taskId, taskData, token) => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const response = await apiConnector(
        "PATCH",
        `${task.COMPLETE_TASK}/${taskId}`,
        taskData,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(setPlanOutdated(true));
        await Promise.all([
          dispatch(getAllTasks(token)),
          dispatch(getDashboardStats(token)),
        ]);
      } else {
        toast.error(response.data.message || "Unable to update task");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
        "Failed to update task"
      );
    }

    dispatch(setLoading(false));
  };
};

export const deleteTask = (taskId, token) => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const response = await apiConnector(
        "DELETE",
        `${task.COMPLETE_TASK}/${taskId}`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(setPlanOutdated(true));
        await Promise.all([
          dispatch(getAllTasks(token)),
          dispatch(getDashboardStats(token)),
        ]);
      } else {
        toast.error(response.data.message || "Unable to delete task");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
        "Failed to delete task"
      );
    }

    dispatch(setLoading(false));
  };
};

export const markTaskPending = (taskId, token) => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const response = await apiConnector(
        "PATCH",
        `${task.COMPLETE_TASK}/${taskId}/pending`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        if (response.data.calendarWarning) {
          toast.error(response.data.calendarWarning);
        }
        dispatch(setPlanOutdated(true));
        await Promise.all([
          dispatch(getAllTasks(token)),
          dispatch(getDashboardStats(token)),
        ]);
      } else {
        toast.error(response.data.message || "Unable to mark task as pending");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
        "Failed to mark task as pending"
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
        dispatch(setPlanOutdated(true));

        await Promise.all([
          dispatch(getAllTasks(token)),
          dispatch(getDashboardStats(token)),
        ]);

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
    dispatch(setPlannerLoading(true));

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

        dispatch(setDailyPlan({
          dailyPlan: response.data.dailyPlan,
          planGeneratedDate: response.data.planGeneratedDate,
          planSyncedToCalendar: response.data.planSyncedToCalendar,
          lastPlanGenerated: response.data.lastPlanGenerated,
          planOutdated: response.data.planOutdated,
        }));

      } else {

        toast.error(response.data.message);

      }

    } catch (error) {

      console.log(error);

      toast.error("Failed to generate daily plan.");

    }

    dispatch(setPlannerLoading(false));
  };
};


export const getAnalytics = (token) => {
  return async (dispatch) => {
    try {
      const response = await apiConnector(
        "GET",
        analytics.GET_ANALYTICS,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      dispatch(
        setAnalytics(
          response.data.analytics
        )
      );
    } catch (error) {
      console.log(error);

      toast.error("Failed to fetch analytics");

      return null;
    }
  };
};


export const getGoogleCalendarStatus = (token, showConnectedToast = false) => {
  return async (dispatch) => {
    dispatch(setCalendarStatusLoading(true));

    try {
      const response = await apiConnector(
        "GET",
        calendar.STATUS,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        dispatch(setCalendarConnected(response.data.connected));

        if (response.data.connected && showConnectedToast) {
          toast.success("Google Calendar connected.");
        }
      } else {
        dispatch(setCalendarConnected(false));
        toast.error(response.data.message || "Unable to fetch Google Calendar status.");
      }
    } catch (error) {
      console.log(error);
      dispatch(setCalendarConnected(false));
      toast.error(
        error.response?.data?.message ||
        "Failed to fetch Google Calendar status."
      );
    }

    dispatch(setCalendarStatusLoading(false));
  };
};

export const getStoredDailyPlan = (token) => {
  return async (dispatch) => {
    try {
      const response = await apiConnector(
        "GET",
        task.GET_STORED_DAILY_PLAN,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        if (response.data.storedPlan) {
          dispatch(setDailyPlan(response.data.storedPlan));
        } else {
          dispatch(clearDailyPlan());
        }
      } else {
        toast.error(response.data.message || "Unable to fetch stored daily plan.");
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
        "Failed to fetch stored daily plan."
      );
    }
  };
};

export const connectGoogleCalendar = (token) => {
  return async (dispatch) => {
    dispatch(setCalendarConnecting(true));

    try {
      const response = await apiConnector(
        "GET",
        calendar.GOOGLE_AUTH,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success && response.data.url) {
        window.location.href = response.data.url;
        return;
      }

      toast.error(response.data.message || "Unable to connect Google Calendar.");
      dispatch(setCalendarConnecting(false));
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
        "Failed to start Google Calendar connection."
      );
      dispatch(setCalendarConnecting(false));
    }
  };
};

export const addPlanToCalendar = (token, plan) => {
  return async (dispatch) => {
    if (!Array.isArray(plan) || plan.length === 0) {
      toast.error("No daily plan found.");
      return;
    }

    dispatch(setCalendarSyncing(true));
    dispatch(setCalendarSynced(false));

    try {
      const response = await apiConnector(
        "POST",
        calendar.ADD_PLAN,
        {
          plan,
        },
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        dispatch(setCalendarSynced(Boolean(response.data.planSyncedToCalendar ?? true)));
        toast.success(response.data.message || "Events added to Google Calendar.");
      } else {
        toast.error(response.data.message || "Failed to add events.");
      }
    } catch (error) {
      console.log(error);

      if ([400, 401, 403].includes(error.response?.status)) {
        dispatch(setCalendarConnected(false));
      }

      toast.error(
        error.response?.data?.message ||
        "Failed to add events to Google Calendar."
      );
    }

    dispatch(setCalendarSyncing(false));
  };
};
