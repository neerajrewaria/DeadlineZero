import { useSelector } from "react-redux";

function NotificationBadge() {
  const { unreadCount } = useSelector((state) => state.notification);

  if (!unreadCount) return null;

  return (
    <span className="notif-badge" aria-label={`${unreadCount} unread notifications`}>
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}

export default NotificationBadge;
