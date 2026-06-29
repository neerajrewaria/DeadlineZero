import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaBell } from "react-icons/fa";
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../services/operations/notificationAPI";
import { setDropdownOpen } from "../../redux/slices/notificationSlice";
import NotificationBadge from "./NotificationBadge";
import NotificationItem from "./NotificationItem";
import "./NotificationDropdown.css";

function NotificationDropdown({ compact = false }) {
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);
  const { token } = useSelector((state) => state.auth);
  const { dropdownOpen, loading, notifications, unreadCount } = useSelector(
    (state) => state.notification
  );

  useEffect(() => {
    if (!token) return;

    dispatch(fetchNotifications(token, true));

    const interval = setInterval(() => {
      dispatch(fetchNotifications(token, true));
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch, token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        dispatch(setDropdownOpen(false));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch]);

  const openDropdown = () => {
    const nextOpen = !dropdownOpen;
    dispatch(setDropdownOpen(nextOpen));

    if (nextOpen && token) {
      dispatch(fetchNotifications(token, true));
    }
  };

  const handleRead = (notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationRead(notification._id, token));
    }
  };

  const handleDelete = (notification) => {
    dispatch(deleteNotification(notification._id, token));
  };

  const handleReadAll = () => {
    dispatch(markAllNotificationsRead(token));
  };

  return (
    <div className="notif-center" ref={dropdownRef}>
      <button
        type="button"
        className={`notif-trigger ${compact ? "notif-trigger--compact" : ""}`}
        onClick={openDropdown}
        aria-label="Open notifications"
        aria-expanded={dropdownOpen}
      >
        <span className="notif-trigger__bell">
          <FaBell />
        </span>
        {!compact && <span className="notif-trigger__text">Notifications</span>}
        <NotificationBadge />
      </button>

      {dropdownOpen && (
        <div className="notif-dropdown">
          <div className="notif-dropdown__header">
            <div>
              <h3>Notifications</h3>
              <p>{unreadCount} unread</p>
            </div>
            <button
              type="button"
              className="notif-dropdown__read-all"
              onClick={handleReadAll}
              disabled={!unreadCount}
            >
              Mark all as read
            </button>
          </div>

          <div className="notif-dropdown__list">
            {loading ? (
              <div className="notif-empty">Loading notifications...</div>
            ) : notifications.length ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onRead={handleRead}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="notif-empty">
                <span>
                  <FaBell />
                </span>
                <p>No new notifications.</p>
              </div>
            )}
          </div>

          <div className="notif-dropdown__footer">
            DeadlineZero keeps an eye on deadlines, planner changes, and calendar sync.
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
