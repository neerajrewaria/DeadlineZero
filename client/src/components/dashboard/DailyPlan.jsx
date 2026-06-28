import { useSelector } from "react-redux";
import "./DailyPlan.css";

function DailyPlan() {

    const { dailyPlan, loading } = useSelector(
        (state) => state.task
    );

    if (loading) {
        return (
            <div className="daily-planner-card">
                <h2>🤖 AI Daily Planner</h2>
                <p>Generating your personalized schedule...</p>
            </div>
        );
    }

    if (!dailyPlan || !dailyPlan.plan || dailyPlan.plan.length === 0) {
        return (
            <div className="daily-planner-card">
                <h2>🤖 AI Daily Planner</h2>
                <p>
                    No daily plan available.
                    Generate some AI tasks first.
                </p>
            </div>
        );
    }

    return (
        <div className="daily-planner-card">

            <div className="planner-header">

                <h2>
                    🤖 AI Daily Planner
                </h2>

                <p>
                    {dailyPlan.summary}
                </p>

            </div>

            <div className="planner-timeline">

                {
                    dailyPlan.plan.map((item, index) => (

                        <div
                            key={index}
                            className="planner-item"
                        >

                            <div className="planner-time">

                                <h4>
                                    {item.startTime}
                                </h4>

                                <span>
                                    ↓
                                </span>

                                <h4>
                                    {item.endTime}
                                </h4>

                            </div>

                            <div className="planner-content">

                                <h3>
                                    {item.taskTitle}
                                </h3>

                                <span
                                    className={`planner-priority ${item.priority}`}
                                >
                                    {item.priority.toUpperCase()}
                                </span>

                                <p>
                                    {item.reason}
                                </p>

                            </div>

                        </div>

                    ))
                }

            </div>

        </div>
    );
}

export default DailyPlan;