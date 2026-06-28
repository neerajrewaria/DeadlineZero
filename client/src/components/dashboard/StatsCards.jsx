import "./StatsCards.css";

function StatsCards({ stats }) {
  if (!stats) {
    return (
      <div className="stats-loading">
        <span className="stats-loading__dot" />
        <span className="stats-loading__dot" />
        <span className="stats-loading__dot" />
      </div>
    );
  }

  const cards = [
    {
      label: "Total Tasks",
      value: stats.totalTasks,
      suffix: "",
      icon: "⬡",
      colorClass: "stats-card--blue",
      trend: "All tasks",
    },
    {
      label: "Completed",
      value: stats.completedTasks,
      suffix: "",
      icon: "✦",
      colorClass: "stats-card--green",
      trend: "Done",
    },
    {
      label: "Pending",
      value: stats.pendingTasks,
      suffix: "",
      icon: "◈",
      colorClass: "stats-card--amber",
      trend: "In progress",
    },
    {
      label: "Completion",
      value: stats.completionRate,
      suffix: "%",
      icon: "◎",
      colorClass: "stats-card--purple",
      trend: "Rate",
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, i) => (
        <div
          className={`stats-card ${card.colorClass}`}
          key={card.label}
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <div className="stats-card__glow" />
          <div className="stats-card__border-beam" />

          <div className="stats-card__top">
            <div className="stats-card__icon-wrap">
              <span className="stats-card__icon">{card.icon}</span>
              <div className="stats-card__icon-ring" />
            </div>
            <span className="stats-card__trend">{card.trend}</span>
          </div>

          <div className="stats-card__value-row">
            <span className="stats-card__value">
              {card.value}
              {card.suffix}
            </span>
          </div>

          <p className="stats-card__label">{card.label}</p>

          <div className="stats-card__bar">
            <div className="stats-card__bar-fill" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;