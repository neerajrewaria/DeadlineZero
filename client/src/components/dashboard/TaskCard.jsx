import { useDispatch, useSelector } from "react-redux";
import { completeTask } from "../../services/operations/taskAPI";

function TaskCard({ task }) {
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);

  return (
    <div className="task-card">

      {/* Header */}

      <div className="task-card-header">

        <span className={`priority ${task.priority}`}>
          🔥 {task.priority.toUpperCase()}
        </span>

        <span className={`status ${task.status}`}>
          {task.status.toUpperCase()}
        </span>

      </div>

      {/* Title */}

      <h3>{task.title}</h3>

      {/* Description */}

      <p>{task.description}</p>

      {/* Meta */}

      <div className="task-meta">

        <p>
          📅 Deadline :
          {" "}
          {new Date(task.deadline).toLocaleDateString()}
        </p>

        <p>
          ⏳ Estimated :
          {" "}
          {task.estimatedHours}
          {" "}
          hrs
        </p>

        <p>
          📂 Category :
          {" "}
          {task.category}
        </p>

      </div>

      {/* Button */}

      <div className="task-footer">

        {
          task.status === "completed" ? (

            <button
              disabled
              className="completed-btn"
            >
              ✅ Completed
            </button>

          ) : (

            <button
              className="complete-btn"
              onClick={() =>
                dispatch(
                  completeTask(
                    task._id,
                    token
                  )
                )
              }
            >
              ✔ Mark Complete
            </button>

          )
        }

      </div>

    </div>
  );
}

export default TaskCard;