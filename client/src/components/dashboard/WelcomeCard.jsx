  import { useSelector } from "react-redux";

function WelcomeCard(){
const { user } = useSelector((state) => state.profile);

return(


<div className="welcome-card">

<h1>
    Welcome back, {user?.firstName} 👋
</h1>

<p>Let's finish today's goals before the deadline.</p>

</div>

)

}

export default WelcomeCard;