function StatsCards({ stats }) {

if(!stats){
return <p>Loading...</p>
}

return(

<div className="stats">

<div className="card">

<h3>Total Tasks</h3>

<h2>{stats.totalTasks}</h2>

</div>

<div className="card">

<h3>Completed</h3>

<h2>{stats.completedTasks}</h2>

</div>

<div className="card">

<h3>Pending</h3>

<h2>{stats.pendingTasks}</h2>

</div>

<div className="card">

<h3>Completion</h3>

<h2>{stats.completionRate}%</h2>

</div>

</div>

)

}

export default StatsCards;