import NotificationDropdown from "../notifications/NotificationDropdown";
import "./Topbar.css";

function Topbar(){

return(

<div className="topbar">

<h2>Dashboard</h2>
<NotificationDropdown compact />

</div>

)

}

export default Topbar;
