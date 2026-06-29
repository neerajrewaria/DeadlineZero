// TaskCard.jsx
import { useDispatch, useSelector } from "react-redux";
import { completeTask, markTaskPending } from "../../services/operations/taskAPI";
import "./TaskCard.css";

const CATEGORY_ICONS = {
  coding:      "💻", study:       "📖", assignment:  "📝",
  gym:         "🏃", interview:   "🎯", review:      "📋",
  project:     "🚀", research:    "🔬", design:      "🎨",
  meeting:     "🤝", reading:     "📚", default:     "◈",
};

const PRIORITY_META = {
  high:   { label: "High",   color: "#f87171", bg: "rgba(248,113,113,.12)", border: "rgba(248,113,113,.28)" },
  medium: { label: "Medium", color: "#fb923c", bg: "rgba(251,146,60,.12)",  border: "rgba(251,146,60,.28)"  },
  low:    { label: "Low",    color: "#4ade80", bg: "rgba(74,222,128,.12)",  border: "rgba(74,222,128,.28)"  },
};

function getCategoryIcon(category = "") {
  const c = category.toLowerCase();
  return CATEGORY_ICONS[c] || CATEGORY_ICONS.default;
}

function formatDeadline(date) {
  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return date; }
}

function TaskCard({ task, index = 0 }) {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.task);

  const priority = task.priority?.toLowerCase() || "low";
  const status   = task.status?.toLowerCase() || "pending";
  const meta     = PRIORITY_META[priority] || PRIORITY_META.low;
  const icon     = getCategoryIcon(task.category);
  const done     = status === "completed";

  return (
    <div
      className={`tc-card${done ? " tc-card--done" : ""}`}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="tc-card__glow" />
      <div className="tc-card__shine" />
      <div className="tc-card__border-beam" />

      {/* Left accent */}
      <div
        className="tc-card__accent"
        style={{ background: meta.color }}
      />

      <div className="tc-card__body">
        {/* Top row */}
        <div className="tc-card__top">
          {/* Icon + Title */}
          <div className="tc-card__left">
            <div
              className="tc-card__icon-wrap"
              style={{ background: meta.bg, borderColor: meta.border }}
            >
              <span className="tc-card__icon">{icon}</span>
            </div>
            <div className="tc-card__titles">
              <h3 className={`tc-card__title${done ? " tc-card__title--done" : ""}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="tc-card__desc">{task.description}</p>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="tc-card__right">
            <span
              className="tc-priority-badge"
              style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
            >
              {priority === "high" ? "🔥" : priority === "medium" ? "⚡" : "🌿"}{" "}
              {meta.label}
            </span>
            <span className={`tc-status-badge tc-status-badge--${status}`}>
              {done ? "✅ Completed" : "⏳ Pending"}
            </span>
          </div>
        </div>

        {/* Meta row */}
        <div className="tc-card__meta">
          <div className="tc-meta-item">
            <span className="tc-meta-item__icon">📅</span>
            <span className="tc-meta-item__label">Deadline</span>
            <span className="tc-meta-item__value">{formatDeadline(task.deadline)}</span>
          </div>
          <div className="tc-meta-divider" />
          <div className="tc-meta-item">
            <span className="tc-meta-item__icon">⏳</span>
            <span className="tc-meta-item__label">Estimated</span>
            <span className="tc-meta-item__value">{task.estimatedHours} hrs</span>
          </div>
          <div className="tc-meta-divider" />
          <div className="tc-meta-item">
            <span className="tc-meta-item__icon">📂</span>
            <span className="tc-meta-item__label">Category</span>
            <span className="tc-meta-item__value">{task.category}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="tc-card__footer">
          <div className="tc-card__footer-left">
            <span className="tc-ai-tag">✦ AI Managed</span>
          </div>

          {done ? (
            <>
              <div className="tc-completed-badge">
                <span className="tc-completed-badge__pulse" />
                Completed
              </div>
              <button
                className="tc-complete-btn"
                onClick={() => dispatch(markTaskPending(task._id, token))}
                disabled={loading}
              >
                <span className="tc-complete-btn__glow" />
                <span className="tc-complete-btn__shine" />
                <span className="tc-complete-btn__content">
                  Mark Pending
                </span>
              </button>
            </>
          ) : (
            <button
              className="tc-complete-btn"
              onClick={() => dispatch(completeTask(task._id, token))}
              disabled={loading}
            >
              <span className="tc-complete-btn__glow" />
              <span className="tc-complete-btn__shine" />
              <span className="tc-complete-btn__content">
                <span className="tc-complete-btn__check">✔</span>
                Mark Complete
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
