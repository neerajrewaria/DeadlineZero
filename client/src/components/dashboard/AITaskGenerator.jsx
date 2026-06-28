import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createTaskWithAI } from "../../services/operations/taskAPI";
import "./AITaskGenerator.css";

const CHIPS = [
  { icon: "💼", label: "Placement Prep",    text: "Prepare for placement: practice DSA, system design, and mock interviews this week" },
  { icon: "📚", label: "Semester Exams",    text: "Prepare for semester exams covering all subjects before the end of this month" },
  { icon: "💻", label: "Coding Practice",   text: "Complete 30 LeetCode problems focusing on arrays, trees, and dynamic programming" },
  { icon: "🏃", label: "Gym Routine",       text: "Gym everyday for one hour — chest Monday, back Tuesday, legs Wednesday, rest Thursday" },
  { icon: "📖", label: "Daily Study",       text: "Study 4 hours daily: 2 hours DSA, 1 hour core subjects, 1 hour revision" },
  { icon: "📝", label: "Assignment Planning", text: "Complete all pending assignments and submit them before their respective deadlines" },
];

const PLACEHOLDERS = [
  "Prepare for my React interview this Friday…",
  "I have 3 assignments due next week…",
  "Finish my DBMS project and prep for placements…",
  "Study for semester exams across 5 subjects…",
];

function AITaskGenerator() {
  const [prompt, setPrompt] = useState("");
  const [placeholderIdx] = useState(() => Math.floor(Math.random() * PLACEHOLDERS.length));
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.task);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    dispatch(createTaskWithAI(prompt, token));
    setPrompt("");
  };

  return (
    <div className="aig-wrap">
      {/* Background layers */}
      <div className="aig-bg-orb aig-bg-orb--1" />
      <div className="aig-bg-orb aig-bg-orb--2" />
      <div className="aig-bg-orb aig-bg-orb--3" />
      <div className="aig-grid-lines" />
      <div className="aig-shine" />

      {/* Floating particles */}
      <div className="aig-particles">
        {[...Array(14)].map((_, i) => (
          <span key={i} className="aig-particle" />
        ))}
      </div>

      {/* Animated border beam */}
      <div className="aig-border-beam" />

      <div className="aig-inner">
        {/* ── Header ── */}
        <div className="aig-header">
          <div className="aig-header__left">
            <div className="aig-orb-wrap">
              <div className="aig-orb-ring aig-orb-ring--outer" />
              <div className="aig-orb-ring aig-orb-ring--inner" />
              <div className="aig-orb-core">
                <span className="aig-orb-icon">✦</span>
                <div className="aig-orb-pulse" />
              </div>
            </div>

            <div className="aig-header__text">
              <div className="aig-header__badges">
                <span className="aig-badge aig-badge--ai">
                  <span className="aig-badge__dot" />
                  AI Powered
                </span>
                <span className="aig-badge aig-badge--gemini">
                  ✦ Gemini Ready
                </span>
              </div>
              <h2 className="aig-title">
                AI Task <span className="aig-title--gradient">Generator</span>
              </h2>
              <p className="aig-subtitle">
                Describe your goals in natural language and let AI organize your day.
              </p>
            </div>
          </div>
        </div>

        {/* ── Quick chips ── */}
        <div className="aig-chips">
          {CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              className="aig-chip"
              onClick={() => setPrompt(chip.text)}
              tabIndex={0}
            >
              <span className="aig-chip__icon">{chip.icon}</span>
              {chip.label}
            </button>
          ))}
        </div>

        {/* ── Form ── */}
        <form onSubmit={submitHandler} className="aig-form">
          <div className="aig-textarea-wrap">
            <div className="aig-textarea-glow" />
            <div className="aig-textarea-border" />
            <textarea
              className="aig-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              placeholder={PLACEHOLDERS[placeholderIdx]}
            />
            <div className="aig-textarea-corner aig-textarea-corner--tl" />
            <div className="aig-textarea-corner aig-textarea-corner--tr" />
            <div className="aig-textarea-corner aig-textarea-corner--bl" />
            <div className="aig-textarea-corner aig-textarea-corner--br" />
          </div>

          <div className="aig-footer">
            <div className="aig-hint">
              <span className="aig-hint__icon">💡</span>
              <span className="aig-hint__text">
                AI detects deadlines, priorities and estimated hours automatically.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`aig-btn${loading ? " aig-btn--loading" : ""}`}
            >
              <span className="aig-btn__glow" />
              <span className="aig-btn__shine" />
              {loading ? (
                <span className="aig-btn__content">
                  <span className="aig-spinner" />
                  Generating…
                </span>
              ) : (
                <span className="aig-btn__content">
                  <span className="aig-btn__sparkle">✨</span>
                  Generate Tasks
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AITaskGenerator;