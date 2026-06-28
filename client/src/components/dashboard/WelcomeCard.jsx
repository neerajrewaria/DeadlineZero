import { useSelector } from "react-redux";
import "./WelcomeCard.css";

function WelcomeCard() {
  const { user } = useSelector((state) => state.profile);

  return (
    <div className="welcome-hero">
      <div className="welcome-hero__bg-orb welcome-hero__bg-orb--1" />
      <div className="welcome-hero__bg-orb welcome-hero__bg-orb--2" />
      <div className="welcome-hero__bg-orb welcome-hero__bg-orb--3" />

      <div className="welcome-hero__particles">
        {[...Array(18)].map((_, i) => (
          <span key={i} className="welcome-hero__particle" />
        ))}
      </div>

      <div className="welcome-hero__shine" />

      <div className="welcome-hero__content">
        <div className="welcome-hero__left">
          <div className="welcome-hero__status-badge">
            <span className="welcome-hero__status-dot" />
            AI Assistant Active
          </div>

          <h1 className="welcome-hero__greeting">
            Welcome back,{" "}
            <span className="welcome-hero__name">
              {user?.firstName}
            </span>{" "}
            👋
          </h1>

          <p className="welcome-hero__tagline">
            Let's turn today's deadlines into today's achievements.
          </p>

          <div className="welcome-hero__badges">
            <span className="welcome-hero__badge">
              <span className="welcome-hero__badge-icon">⚡</span>
              Focus Mode
            </span>
            <span className="welcome-hero__badge">
              <span className="welcome-hero__badge-icon">🎯</span>
              Productivity
            </span>
            <span className="welcome-hero__badge">
              <span className="welcome-hero__badge-icon">🤖</span>
              AI Ready
            </span>
          </div>
        </div>

        <div className="welcome-hero__right">
          <div className="welcome-hero__orb-container">
            <div className="welcome-hero__orb-ring welcome-hero__orb-ring--outer" />
            <div className="welcome-hero__orb-ring welcome-hero__orb-ring--mid" />
            <div className="welcome-hero__orb-ring welcome-hero__orb-ring--inner" />
            <div className="welcome-hero__orb-core">
              <div className="welcome-hero__orb-pulse" />
              <span className="welcome-hero__orb-icon">✦</span>
            </div>
            <div className="welcome-hero__orb-dot welcome-hero__orb-dot--1" />
            <div className="welcome-hero__orb-dot welcome-hero__orb-dot--2" />
            <div className="welcome-hero__orb-dot welcome-hero__orb-dot--3" />
          </div>

          <div className="welcome-hero__ai-card">
            <span className="welcome-hero__ai-card-icon">✨</span>
            <span className="welcome-hero__ai-card-text">
              AI is ready to generate today's perfect schedule.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeCard;