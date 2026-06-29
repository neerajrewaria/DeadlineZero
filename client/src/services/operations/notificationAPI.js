import { apiConnector } from "../apiconnector";
import { notifications } from "../apis";
import {
  markAllReadLocal,
  mergeNotifications,
  removeNotificationLocal,
  removeNotificationsByIds,
  setLastFetchedAt,
  setNotificationLoading,
  setNotifications,
  setUnreadCount,
  updateNotificationRead,
} from "../../redux/slices/notificationSlice";

const browserNotificationInFlight = new Set();

const shouldShowBrowserNotification = (notification) => {
  if (notification.browserNotifiedAt) return false;
  if (browserNotificationInFlight.has(notification._id)) return false;

  return (
    notification.priority === "critical" ||
    ["deadline", "dueToday", "overdue", "calendar"].includes(notification.type)
  );
};

const recordBrowserNotificationShown = async (notificationId, token) => {
  try {
    await apiConnector(
      "PATCH",
      `${notifications.BROWSER_SHOWN}/${notificationId}/browser-shown`,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );
  } catch (error) {
    console.log(error);
  } finally {
    browserNotificationInFlight.delete(notificationId);
  }
};

const showBrowserNotification = (notification, token) => {
  if (!("Notification" in window) || !shouldShowBrowserNotification(notification)) return;

  browserNotificationInFlight.add(notification._id);

  const notify = () => {
    if (Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        tag: notification._id,
      });
      recordBrowserNotificationShown(notification._id, token);
    }
  };

  if (Notification.permission === "default") {
    Notification.requestPermission()
      .then((permission) => {
        if (permission === "granted") {
          notify();
        } else {
          recordBrowserNotificationShown(notification._id, token);
        }
      })
      .catch(() => recordBrowserNotificationShown(notification._id, token));
    return;
  }

  if (Notification.permission === "denied") {
    recordBrowserNotificationShown(notification._id, token);
    return;
  }

  notify();
};

export const fetchNotifications = (token, showBrowserAlerts = false) => {
  return async (dispatch, getState) => {
    const { lastFetchedAt, notifications: currentNotifications } = getState().notification;
    const shouldFetchChangesOnly = Boolean(lastFetchedAt);
    const url = shouldFetchChangesOnly
      ? `${notifications.GET_NOTIFICATIONS}?since=${encodeURIComponent(lastFetchedAt)}`
      : notifications.GET_NOTIFICATIONS;

    if (!currentNotifications.length) {
      dispatch(setNotificationLoading(true));
    }

    try {
      const response = await apiConnector(
        "GET",
        url,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        if (shouldFetchChangesOnly) {
          dispatch(mergeNotifications(response.data.notifications));
          dispatch(removeNotificationsByIds(response.data.dismissedIds || []));
        } else {
          dispatch(setNotifications(response.data.notifications));
        }

        dispatch(setUnreadCount(response.data.unreadCount ?? 0));
        dispatch(setLastFetchedAt(response.data.serverTime || new Date().toISOString()));

        if (showBrowserAlerts) {
          response.data.notifications
            .filter((notification) => !notification.isRead)
            .slice(0, 3)
            .forEach((notification) => showBrowserNotification(notification, token));
        }
      }
    } catch (error) {
      console.log(error);
    }

    dispatch(setNotificationLoading(false));
  };
};

export const fetchUnreadCount = (token) => {
  return async (dispatch) => {
    try {
      const response = await apiConnector(
        "GET",
        notifications.UNREAD_COUNT,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        dispatch(setUnreadCount(response.data.unreadCount));
      }
    } catch (error) {
      console.log(error);
    }
  };
};

export const markNotificationRead = (id, token) => {
  return async (dispatch) => {
    dispatch(updateNotificationRead(id));

    try {
      await apiConnector(
        "PATCH",
        `${notifications.MARK_READ}/${id}/read`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );
    } catch (error) {
      console.log(error);
      dispatch(fetchNotifications(token));
    }
  };
};

export const markAllNotificationsRead = (token) => {
  return async (dispatch) => {
    dispatch(markAllReadLocal());

    try {
      await apiConnector(
        "PATCH",
        notifications.MARK_ALL_READ,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );
    } catch (error) {
      console.log(error);
      dispatch(fetchNotifications(token));
    }
  };
};

export const deleteNotification = (id, token) => {
  return async (dispatch) => {
    dispatch(removeNotificationLocal(id));

    try {
      await apiConnector(
        "DELETE",
        `${notifications.DELETE_NOTIFICATION}/${id}`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );
    } catch (error) {
      console.log(error);
      dispatch(fetchNotifications(token));
    }
  };
};
