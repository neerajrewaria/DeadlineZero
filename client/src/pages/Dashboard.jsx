import Sidebar from "../components/dashboard/Sidebar";
import Topbar from "../components/dashboard/Topbar";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import StatsCards from "../components/dashboard/StatsCards";
import TaskList from "../components/dashboard/TaskList";
import DailyPlan from "../components/dashboard/DailyPlan";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import { getDashboardStats } from "../services/operations/taskAPI";
import { getAllTasks, getDailyPlan } from "../services/operations/taskAPI";
import AITaskGenerator from "../components/dashboard/AiTaskGenerator";

import "./Dashboard.css";

function Dashboard() {


    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    const { stats } = useSelector((state) => state.task);


    useEffect(() => {
        dispatch(getDashboardStats(token));
        dispatch(getAllTasks(token));
    }, [dispatch, token]);
    console.log(stats);

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <div className="dashboard-main">

                <Topbar />

                <section id="hero">
                    <WelcomeCard />
                </section>

                <section id="stats">
                    <StatsCards stats={stats} />
                </section>

                <div className="dashboard-grid">

                    <section id="generator">
                        <AITaskGenerator />
                    </section>
                    <section id="planner">
                        <DailyPlan />
                    </section>

                    <section id="tasks">
                        <TaskList />
                    </section>



                </div>

            </div>

        </div>
    );
}

export default Dashboard;