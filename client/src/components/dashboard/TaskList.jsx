// TaskList.jsx
import { useSelector } from "react-redux";
import TaskCard from "./TaskCard";
import "./TaskList.css";

function TaskList() {
  const { tasks } = useSelector((state) => state.task);

  return (
    <div className="tl-wrap">
      <div className="tl-bg-orb tl-bg-orb--1" />
      <div className="tl-bg-orb tl-bg-orb--2" />
      <div className="tl-border-beam" />

      <div className="tl-inner">
        {/* Header */}
        <div className="tl-header">
          <div className="tl-header__left">
            <div className="tl-header__icon-wrap">
              <span className="tl-header__icon">◈</span>
            </div>
            <div>
              <div className="tl-header__badges">
                <span className="tl-badge tl-badge--ai">
                  <span className="tl-badge__dot" />
                  AI Prioritized
                </span>
                <span className="tl-badge tl-badge--count">
                  {tasks.length} Tasks
                </span>
              </div>
              <h2 className="tl-header__title">
                All <span className="tl-grad-text">Tasks</span>
              </h2>
              <p className="tl-header__sub">
                AI prioritized tasks for maximum productivity.
              </p>
            </div>
          </div>
        </div>

        {/* Task list or empty */}
        {tasks.length === 0 ? (
          <div className="tl-empty">
            <div className="tl-empty__orb-wrap">
              <div className="tl-orb-ring tl-orb-ring--outer" />
              <div className="tl-orb-ring tl-orb-ring--mid" />
              <div className="tl-orb-ring tl-orb-ring--inner" />
              <div className="tl-orb-core">
                <span className="tl-orb-icon">✦</span>
                <div className="tl-orb-pulse" />
              </div>
              <div className="tl-orb-dot tl-orb-dot--1" />
              <div className="tl-orb-dot tl-orb-dot--2" />
              <div className="tl-orb-dot tl-orb-dot--3" />
            </div>
            <h3 className="tl-empty__title">No tasks yet.</h3>
            <p className="tl-empty__sub">
              Generate tasks using AI to get started.
            </p>
          </div>
        ) : (
          <div className="tl-list">
            {tasks.map((task, i) => (
              <TaskCard key={task._id} task={task} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskList;