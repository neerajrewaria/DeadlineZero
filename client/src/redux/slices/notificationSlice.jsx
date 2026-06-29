import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  dropdownOpen: false,
  lastFetchedAt: null,
};

const getPriorityRank = (priority) => {
  const ranks = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return ranks[priority] ?? 2;
};

const sortNotifications = (notifications) => {
  return [...notifications].sort((a, b) => {
    const priorityDiff = getPriorityRank(a.priority) - getPriorityRank(b.priority);
    if (priorityDiff !== 0) return priorityDiff;

    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;

    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = sortNotifications(action.payload || []);
    },
    mergeNotifications: (state, action) => {
      const incoming = action.payload || [];
      const byId = new Map(state.notifications.map((notification) => [notification._id, notification]));

      incoming.forEach((notification) => {
        if (notification.isDismissed) {
          byId.delete(notification._id);
        } else {
          byId.set(notification._id, notification);
        }
      });

      state.notifications = sortNotifications(Array.from(byId.values()));
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload || 0;
    },
    setLastFetchedAt: (state, action) => {
      state.lastFetchedAt = action.payload;
    },
    setNotificationLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDropdownOpen: (state, action) => {
      state.dropdownOpen = action.payload;
    },
    updateNotificationRead: (state, action) => {
      const id = action.payload;
      const item = state.notifications.find((notification) => notification._id === id);

      if (item && !item.isRead) {
        item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllReadLocal: (state) => {
      state.notifications = state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }));
      state.unreadCount = 0;
    },
    removeNotificationLocal: (state, action) => {
      const id = action.payload;
      const item = state.notifications.find((notification) => notification._id === id);
      state.notifications = state.notifications.filter((notification) => notification._id !== id);

      if (item && !item.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    removeNotificationsByIds: (state, action) => {
      const ids = new Set(action.payload || []);
      if (!ids.size) return;

      state.notifications = state.notifications.filter((notification) => !ids.has(notification._id));
    },
  },
});

export const {
  markAllReadLocal,
  mergeNotifications,
  removeNotificationLocal,
  removeNotificationsByIds,
  setDropdownOpen,
  setLastFetchedAt,
  setNotificationLoading,
  setNotifications,
  setUnreadCount,
  updateNotificationRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;
