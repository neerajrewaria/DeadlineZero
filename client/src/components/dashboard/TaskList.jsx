import { useSelector } from "react-redux";
import TaskCard from "./TaskCard";

function TaskList() {

    const { tasks } = useSelector(
        state => state.task
    );

    return (

        <div className="dashboard-card">

            <h2>Today's Tasks</h2>

            {
                tasks.map(task => (

                    <TaskCard
                        key={task._id}
                        task={task}
                    />

                ))
            }

        </div>

    );

}

export default TaskList;