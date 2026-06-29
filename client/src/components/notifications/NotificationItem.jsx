import {
  FaBell,
  FaCalendarAlt,
  FaCheck,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFire,
  FaMagic,
  FaRegClock,
  FaTrash,
} from "react-icons/fa";
import { MdTrendingUp } from "react-icons/md";

const TYPE_ICON = {
  deadline: FaExclamationTriangle,
  dueToday: FaFire,
  overdue: FaRegClock,
  calendar: FaCalendarAlt,
  ai: FaMagic,
  planner: FaExclamationTriangle,
  task: FaCheck,
  productivity: MdTrendingUp,
  warning: FaExclamationTriangle,
  success: FaCheckCircle,
  system: FaBell,
};

function getRelativeTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getActionLabel(notification) {
  if (notification.relatedTask?.calendarEventLink) return "View Event";
  if (notification.type === "calendar") {
    return notification.actionLink?.startsWith("http") ? "View Event" : "View Plan";
  }
  if (notification.type === "planner" || notification.type === "ai") return "View Plan";
  if (notification.type === "productivity") return "View Analytics";
  if (notification.relatedTask) return "Open Task";

  return "Open";
}

function NotificationItem({ notification, onRead, onDelete }) {
  const Icon = TYPE_ICON[notification.type] || TYPE_ICON.system;
  const isUnread = !notification.isRead;

  const handleAction = () => {
    onRead(notification);

    const actionLink = notification.relatedTask?.calendarEventLink || notification.actionLink;

    if (!actionLink) return;

    if (actionLink.startsWith("http")) {
      window.open(actionLink, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = actionLink;
    }
  };

  return (
    <article className={`notif-item notif-item--${notification.priority} ${isUnread ? "notif-item--unread" : ""}`}>
      <button
        type="button"
        className="notif-item__main"
        onClick={() => onRead(notification)}
      >
        <span className="notif-item__icon">
          <Icon />
        </span>
        <span className="notif-item__body">
          <span className="notif-item__top">
            <span className="notif-item__title">{notification.title}</span>
            <span className="notif-item__time">{getRelativeTime(notification.createdAt)}</span>
          </span>
          <span className="notif-item__message">{notification.message}</span>
          {notification.relatedTask?.calendarEventId && (
            <span className="notif-item__calendar">
              <FaCalendarAlt /> Synced to Google Calendar
            </span>
          )}
          {notification.relatedTask && !notification.relatedTask.calendarEventId && (
            <span className="notif-item__calendar">
              <FaCalendarAlt /> Not yet synced
            </span>
          )}
        </span>
        {isUnread && <span className="notif-item__read-dot" />}
      </button>

      <div className="notif-item__actions">
        <button type="button" className="notif-item__action" onClick={handleAction}>
          {getActionLabel(notification)}
        </button>
        <button
          type="button"
          className="notif-item__dismiss"
          onClick={() => onDelete(notification)}
          aria-label="Dismiss notification permanently"
        >
          <FaTrash />
        </button>
      </div>
    </article>
  );
}

export default NotificationItem;
