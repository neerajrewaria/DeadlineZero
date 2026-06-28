import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import StatsCards from "../components/dashboard/StatsCards";
import TaskList from "../components/dashboard/TaskList";
import DailyPlan from "../components/dashboard/DailyPlan";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import { getDashboardStats } from "../services/operations/taskAPI";
import { getAllTasks,getDailyPlan } from "../services/operations/taskAPI";
import AITaskGenerator from "../components/dashboard/AiTaskGenerator";

import "./Dashboard.css";

function Dashboard() {


    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    const [stats, setStats] = useState(null);

useEffect(() => {
    dispatch(getDashboardStats(token));
    dispatch(getAllTasks(token));
     dispatch(getDailyPlan(token));
}, [dispatch, token]);

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Topbar />

                <WelcomeCard />

                <StatsCards stats={stats} />

                <div className="dashboard-grid">
                   
                   <AITaskGenerator />
                   <DailyPlan />

                    <TaskList />

                    

                </div>

            </div>

        </div>
    );
}

export default Dashboard;