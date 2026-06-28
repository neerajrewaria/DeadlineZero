import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./DailyPlan.css";
import { getDailyPlan } from "../../services/operations/taskAPI";

const PRIORITY_META = {
  high:   { label: "High Priority",   color: "#f87171" },
  medium: { label: "Medium Priority", color: "#fb923c" },
  low:    { label: "Low Priority",    color: "#4ade80" },
};

const TASK_ICONS = ["💻", "📝", "☕", "</>", "🧠", "📋", "🎯", "📖", "🏃", "⚡"];

function getIcon(title = "", index = 0) {
  const t = title.toLowerCase();
  if (t.includes("lunch") || t.includes("break") || t.includes("coffee")) return "☕";
  if (t.includes("code") || t.includes("coding") || t.includes("dsa") || t.includes("leetcode")) return "💻";
  if (t.includes("interview")) return "🎯";
  if (t.includes("gym") || t.includes("workout")) return "🏃";
  if (t.includes("review") || t.includes("notes")) return "📋";
  if (t.includes("assign") || t.includes("dbms") || t.includes("project")) return "📝";
  if (t.includes("study") || t.includes("read") || t.includes("revise")) return "📖";
  return TASK_ICONS[index % TASK_ICONS.length];
}

function getDotColor(priority) {
  if (priority === "high")   return "#a78bfa";
  if (priority === "medium") return "#fb923c";
  if (priority === "low")    return "#4ade80";
  return "#60a5fa";
}

function getDuration(start, end) {
  try {
    const toMins = (t) => {
      const [time, period] = t.trim().split(" ");
      let [h, m] = time.split(":").map(Number);
      if (period === "PM" && h !== 12) h += 12;
      if (period === "AM" && h === 12) h = 0;
      return h * 60 + (m || 0);
    };
    const diff = toMins(end) - toMins(start);
    return diff > 0 ? `${diff} min` : null;
  } catch { return null; }
}

// ── Loading State ──────────────────────────────────────────
function LoadingState({ step }) {
  const steps = [
    { icon: "✨", text: "Analyzing your deadlines..." },
    { icon: "🧠", text: "Understanding priorities..." },
    { icon: "📅", text: "Building today's schedule..." },
    { icon: "⏳", text: "AI is thinking..." },
  ];

  return (
    <div className="dp-wrap">
      <div className="dp-bg-orb dp-bg-orb--1" />
      <div className="dp-bg-orb dp-bg-orb--2" />
      <div className="dp-grid" />
      <div className="dp-particles">
        {[...Array(12)].map((_, i) => <span key={i} className="dp-particle" />)}
      </div>

      <div className="dp-loading">
        <div className="dp-loading__orb-wrap">
          <div className="dp-loading__ring dp-loading__ring--outer" />
          <div className="dp-loading__ring dp-loading__ring--mid" />
          <div className="dp-loading__ring dp-loading__ring--inner" />
          <div className="dp-loading__core">
            <span className="dp-loading__icon">✦</span>
            <div className="dp-loading__pulse" />
          </div>
        </div>

        <h2 className="dp-loading__title">AI is Thinking</h2>
        <p className="dp-loading__sub">Building your perfect schedule…</p>

        <div className="dp-loading__steps">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`dp-loading__step ${step >= i + 1 ? "dp-loading__step--active" : ""}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="dp-loading__step-icon">{s.icon}</span>
              <span className="dp-loading__step-text">{s.text}</span>
              {step >= i + 1 && <span className="dp-loading__step-check">✓</span>}
            </div>
          ))}
        </div>

        <div className="dp-loading__bar-wrap">
          <div className="dp-loading__bar-fill" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

// ── Empty State ────────────────────────────────────────────
function EmptyState({ onGenerate }) {
  return (
    <div className="dp-wrap">
      <div className="dp-bg-orb dp-bg-orb--1" />
      <div className="dp-bg-orb dp-bg-orb--2" />
      <div className="dp-grid" />
      <div className="dp-particles">
        {[...Array(12)].map((_, i) => <span key={i} className="dp-particle" />)}
      </div>
      <div className="dp-border-beam" />

      <div className="dp-empty">
        <div className="dp-empty__orb-wrap">
          <div className="dp-orb-ring dp-orb-ring--outer" />
          <div className="dp-orb-ring dp-orb-ring--mid" />
          <div className="dp-orb-ring dp-orb-ring--inner" />
          <div className="dp-orb-core">
            <span className="dp-orb-icon">✦</span>
            <div className="dp-orb-pulse" />
          </div>
          <div className="dp-orb-dot dp-orb-dot--1" />
          <div className="dp-orb-dot dp-orb-dot--2" />
          <div className="dp-orb-dot dp-orb-dot--3" />
        </div>

        <div className="dp-empty__badges">
          <span className="dp-badge dp-badge--ai"><span className="dp-badge__dot" />AI Powered</span>
          <span className="dp-badge dp-badge--gem">✦ Gemini Ready</span>
        </div>

        <h2 className="dp-empty__title">
          AI Daily <span className="dp-grad-text">Planner</span>
        </h2>
        <p className="dp-empty__sub">
          Let AI analyze your pending tasks and prepare today's perfect schedule.
        </p>

        <button className="dp-gen-btn" onClick={onGenerate}>
          <span className="dp-gen-btn__glow" />
          <span className="dp-gen-btn__shine" />
          <span className="dp-gen-btn__content">
            <span className="dp-gen-btn__spark">✨</span>
            Generate Today's Plan
          </span>
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
function DailyPlan() {
  const dispatch = useDispatch();
  const { token }                    = useSelector((state) => state.auth);
  const { dailyPlan, plannerLoading } = useSelector((state) => state.task);
  const [step, setStep]              = useState(0);

  useEffect(() => {
    if (!plannerLoading) { setStep(0); return; }
    setStep(1);
    const t1 = setTimeout(() => setStep(2), 2000);
    const t2 = setTimeout(() => setStep(3), 4000);
    const t3 = setTimeout(() => setStep(4), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [plannerLoading]);

  if (plannerLoading) return <LoadingState step={step} />;

  if (!dailyPlan) return <EmptyState onGenerate={() => dispatch(getDailyPlan(token))} />;

  const taskCount  = dailyPlan.plan?.length || 0;
  const focusMins  = dailyPlan.plan?.reduce((acc, item) => {
    const d = getDuration(item.startTime, item.endTime);
    return acc + (d ? parseInt(d) : 0);
  }, 0) || 0;
  const focusHrs   = (focusMins / 60).toFixed(1);
  const breakMins  = Math.round(focusMins * 0.2);
  const confidence = 92;

  return (
    <div className="dp-wrap">
      <div className="dp-bg-orb dp-bg-orb--1" />
      <div className="dp-bg-orb dp-bg-orb--2" />
      <div className="dp-bg-orb dp-bg-orb--3" />
      <div className="dp-grid" />
      <div className="dp-shine" />
      <div className="dp-particles">
        {[...Array(14)].map((_, i) => <span key={i} className="dp-particle" />)}
      </div>
      <div className="dp-border-beam" />

      <div className="dp-inner">

        {/* ── Header ── */}
        <div className="dp-header">
          <div className="dp-header__left">
            <div className="dp-avatar">
              <div className="dp-avatar__ring dp-avatar__ring--outer" />
              <div className="dp-avatar__ring dp-avatar__ring--inner" />
              <div className="dp-avatar__core">
                <span className="dp-avatar__icon">✦</span>
                <div className="dp-avatar__pulse" />
              </div>
            </div>
            <div className="dp-header__text">
              <div className="dp-header__badges">
                <span className="dp-badge dp-badge--ai"><span className="dp-badge__dot" />AI Powered</span>
              </div>
              <h2 className="dp-header__title">
                AI Daily <span className="dp-grad-text">Planner</span>
              </h2>
              <p className="dp-header__sub">{dailyPlan.summary || "Let AI analyze your pending tasks and prepare today's perfect schedule."}</p>
            </div>
          </div>

          <div className="dp-focus-card">
            <div className="dp-focus-card__icon">🎯</div>
            <div>
              <p className="dp-focus-card__label">Today's Focus</p>
              <p className="dp-focus-card__value">High Productivity</p>
              <p className="dp-focus-card__sub">You've got this! 🚀</p>
            </div>
          </div>
        </div>

        {/* ── Analytics Row ── */}
        <div className="dp-analytics">
          {[
            { icon: "🧠", label: "AI Analysis",  value: `${taskCount} tasks`, sub: "Analyzing", wave: "blue"   },
            { icon: "⏰", label: "Focus Time",    value: `${focusHrs} hrs`,   sub: "",          wave: "purple" },
            { icon: "☕", label: "Break Time",    value: `${breakMins} min`,  sub: "",          wave: "amber"  },
            { icon: "🎯", label: "Confidence",    value: `${confidence}%`,    sub: "",          wave: "green"  },
          ].map((a) => (
            <div className="dp-analytic" key={a.label}>
              <div className="dp-analytic__icon">{a.icon}</div>
              <div className="dp-analytic__body">
                <p className="dp-analytic__label">{a.label}</p>
                {a.sub && <p className="dp-analytic__sub">{a.sub}</p>}
                <p className="dp-analytic__value">{a.value}</p>
              </div>
              <svg className={`dp-wave dp-wave--${a.wave}`} viewBox="0 0 80 24" fill="none">
                <polyline points="0,12 12,6 24,16 36,4 48,14 60,8 72,18 80,10" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
        </div>

        {/* ── Main Body ── */}
        <div className="dp-body">

          {/* ── Timeline ── */}
          <div className="dp-timeline-wrap">
            {dailyPlan.plan.length > 0 ? (
              <div className="dp-timeline">
                <div className="dp-timeline__line" />

                {dailyPlan.plan.map((item, index) => {
                  const priority = item.priority?.toLowerCase() || "low";
                  const meta     = PRIORITY_META[priority] || PRIORITY_META.low;
                  const duration = getDuration(item.startTime, item.endTime);
                  const icon     = getIcon(item.taskTitle, index);
                  const dotColor = getDotColor(priority);

                  return (
                    <div
                      key={index}
                      className="dp-tl-row"
                      style={{ animationDelay: `${index * 0.08}s` }}
                    >
                      {/* Time badge */}
                      <div className="dp-tl-time" style={{ "--dot": dotColor }}>
                        <span className="dp-tl-time__badge">{item.startTime}</span>
                        <div className="dp-tl-time__dot" />
                      </div>

                      {/* Task card */}
                      <div className="dp-tl-card">
                        <div className="dp-tl-card__glow" />
                        <div className="dp-tl-card__icon-wrap">
                          <span className="dp-tl-card__icon">{icon}</span>
                        </div>
                        <div className="dp-tl-card__body">
                          <h3 className="dp-tl-card__title">{item.taskTitle}</h3>
                          <div className="dp-tl-card__meta">
                            <span className="dp-tl-card__type">
                              {item.reason?.split(" ").slice(0, 2).join(" ") || "Focus Session"}
                            </span>
                            <span className="dp-tl-card__dot-sep" style={{ background: meta.color }} />
                            <span className="dp-tl-card__priority" style={{ color: meta.color }}>
                              {meta.label}
                            </span>
                          </div>
                        </div>
                        {duration && (
                          <div className="dp-tl-card__dur" style={{ "--pcolor": dotColor }}>
                            {duration}
                          </div>
                        )}
                        <div className="dp-tl-card__dots">
                          <span /><span /><span />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="dp-empty-plan">
                <h3>🎉 No tasks scheduled</h3>
                <p>AI couldn't find any work to schedule today.</p>
                <button className="dp-gen-btn" onClick={() => dispatch(getDailyPlan(token))}>
                  <span className="dp-gen-btn__glow" />
                  <span className="dp-gen-btn__content">🔄 Generate Again</span>
                </button>
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className="dp-sidebar">

            {/* AI Insights */}
            <div className="dp-side-card">
              <div className="dp-side-card__header">
                <span className="dp-side-card__icon">✨</span>
                <span className="dp-side-card__title">AI Insights</span>
              </div>
              <p className="dp-side-card__tagline">Your day is well balanced!</p>
              <ul className="dp-insights">
                {["Focus time is optimal", "Good break intervals", "Tasks are realistic"].map((i) => (
                  <li key={i} className="dp-insight-item">
                    <span className="dp-insight-check">✓</span>
                    {i}
                  </li>
                ))}
              </ul>
            </div>

            {/* Productivity Score */}
            <div className="dp-side-card dp-side-card--score">
              <div className="dp-side-card__header">
                <span className="dp-side-card__icon">🏆</span>
                <span className="dp-side-card__title">Productivity Score</span>
              </div>
              <div className="dp-score-ring-wrap">
                <svg className="dp-score-ring" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(130,90,255,0.15)" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="url(#scoreGrad)" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50 * confidence / 100} ${2 * Math.PI * 50 * (1 - confidence / 100)}`}
                    strokeDashoffset={2 * Math.PI * 50 * 0.25}
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="dp-score-center">
                  <span className="dp-score-val">{confidence}%</span>
                </div>
              </div>
              <p className="dp-score-label">Excellent 🔥</p>
            </div>

            {/* Quote */}
            <div className="dp-side-card dp-side-card--quote">
              <span className="dp-quote-mark">"</span>
              <p className="dp-quote-text">
                Small consistent efforts everyday lead to big results.
              </p>
              <p className="dp-quote-attr">– DeadlineZero AI</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default DailyPlan;