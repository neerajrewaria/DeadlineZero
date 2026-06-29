import Navbar from "../components/common/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
    const navigate = useNavigate();
  return (
    <div className="home-root">
      <Navbar />

      {/* ── Below-nav workspace ────────────────────────────────────── */}
      <main className="home-main" role="main">

        {/* ── LEFT: Sidebar placeholder ────────────────────────────
            Future: navigation links, project list, quick-add, etc.
        ──────────────────────────────────────────────────────────── */}
        <aside className="home-sidebar" aria-label="Sidebar placeholder">
          {/* Sidebar component goes here */}
        </aside>

        {/* ── RIGHT: Primary content area ─────────────────────────
            Future: Dashboard, AI Planner, Task List, Analytics, etc.
        ──────────────────────────────────────────────────────────── */}
        <section className="home-content" aria-label="Main content placeholder">

          {/* ── Dashboard placeholder ───────────────────────────────
              Future: KPI cards, progress rings, streak counter, etc.
          ──────────────────────────────────────────────────────────── */}
          <div className="home-dashboard-placeholder">
            {/* Dashboard component goes here */}
          </div>

          {/* ════════════════════════════════════════════════════════
              LANDING PAGE UI — purely presentational, no logic
          ════════════════════════════════════════════════════════ */}

          {/* ── Animated Background ────────────────────────────────── */}
          <div className="lp-bg" aria-hidden="true">
            <div className="lp-blob lp-blob--1"></div>
            <div className="lp-blob lp-blob--2"></div>
            <div className="lp-blob lp-blob--3"></div>
            <div className="lp-grid-overlay"></div>
          </div>

          {/* ── HERO ─────────────────────────────────────────────────── */}
          <section className="lp-hero" aria-label="Hero">

            {/* Left copy */}
            <div className="lp-hero__copy">
              <div className="lp-eyebrow">
                <span className="lp-eyebrow__dot"></span>
                AI-Powered Productivity
              </div>

              <h1 className="lp-hero__heading">
                Never Miss<br />
                <span className="lp-gradient-text">Another Deadline</span><br />
                Again.
              </h1>

              <p className="lp-hero__sub">
                DeadlineZero is an AI productivity companion that intelligently
                prioritizes your work, generates smart schedules, predicts
                deadlines, and helps you stay relentlessly ahead.
              </p>

              <div className="lp-hero__actions">
                <button className="lp-btn lp-btn--primary"  onClick={() => navigate("/signup")}>
                  <span>Get Started Free</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="lp-btn lp-btn--secondary">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/>
                  </svg>
                  Watch Demo
                </button>
              </div>

              <ul className="lp-trust-badges" aria-label="Trust badges">
                <li><span className="lp-badge-check">✓</span> AI Powered</li>
                <li><span className="lp-badge-check">✓</span> Smart Planning</li>
                <li><span className="lp-badge-check">✓</span> Free Forever</li>
              </ul>
            </div>

            {/* Right — animated AI dashboard mockup */}
            <div className="lp-hero__mockup" aria-hidden="true">

              {/* Main card */}
              <div className="lp-card lp-card--main lp-float">
                <div className="lp-card__header">
                  <span className="lp-card__icon">🤖</span>
                  <div>
                    <div className="lp-card__title">AI Planner</div>
                    <div className="lp-card__sub">Active · 3 tasks optimized</div>
                  </div>
                  <span className="lp-pulse-dot"></span>
                </div>
                <div className="lp-task-list">
                  <div className="lp-task lp-task--high">
                    <span className="lp-task__priority">P1</span>
                    <span className="lp-task__name">Database Assignment</span>
                    <span className="lp-task__due">Due 2h</span>
                  </div>
                  <div className="lp-task lp-task--med">
                    <span className="lp-task__priority">P2</span>
                    <span className="lp-task__name">Design Mockup</span>
                    <span className="lp-task__due">Due 6h</span>
                  </div>
                  <div className="lp-task lp-task--low">
                    <span className="lp-task__priority">P3</span>
                    <span className="lp-task__name">Weekly Report</span>
                    <span className="lp-task__due">Due tmr</span>
                  </div>
                </div>
              </div>

              {/* Floating mini-cards */}
              <div className="lp-card lp-card--mini lp-card--score lp-float lp-float--slow">
                <div className="lp-mini-label">Priority Score</div>
                <div className="lp-mini-value lp-gradient-text">94</div>
                <div className="lp-mini-bar">
                  <div className="lp-mini-bar__fill"></div>
                </div>
              </div>

              <div className="lp-card lp-card--mini lp-card--streak lp-float lp-float--slower">
                <div className="lp-mini-label">🔥 Streak</div>
                <div className="lp-mini-value">12 days</div>
              </div>

              <div className="lp-card lp-card--mini lp-card--deadline lp-float lp-float--fast">
                <div className="lp-mini-label">⏰ Next deadline</div>
                <div className="lp-mini-value lp-mini-value--sm">DB Assignment · 2h left</div>
              </div>

              <div className="lp-card lp-card--mini lp-card--focus lp-float lp-float--med">
                <div className="lp-mini-label">Focus Mode</div>
                <div className="lp-focus-ring">
                  <svg viewBox="0 0 48 48" className="lp-focus-svg">
                    <circle cx="24" cy="24" r="20" className="lp-focus-track"/>
                    <circle cx="24" cy="24" r="20" className="lp-focus-prog"/>
                  </svg>
                  <span className="lp-focus-pct">78%</span>
                </div>
              </div>

            </div>
          </section>

          {/* ── STATS ─────────────────────────────────────────────────── */}
          <section className="lp-stats" aria-label="Statistics">
            <div className="lp-stats__grid">
              <div className="lp-stat lp-fade-up" style={{"--delay":"0s"}}>
                <div className="lp-stat__value lp-gradient-text">10K+</div>
                <div className="lp-stat__label">Tasks Planned</div>
              </div>
              <div className="lp-stat lp-fade-up" style={{"--delay":"0.1s"}}>
                <div className="lp-stat__value lp-gradient-text">97%</div>
                <div className="lp-stat__label">Deadlines Completed</div>
              </div>
              <div className="lp-stat lp-fade-up" style={{"--delay":"0.2s"}}>
                <div className="lp-stat__value lp-gradient-text">24/7</div>
                <div className="lp-stat__label">AI Assistant</div>
              </div>
              <div className="lp-stat lp-fade-up" style={{"--delay":"0.3s"}}>
                <div className="lp-stat__value lp-gradient-text">50+</div>
                <div className="lp-stat__label">Countries</div>
              </div>
            </div>
          </section>

          {/* ── FEATURES ──────────────────────────────────────────────── */}
          <section className="lp-features" aria-label="Features">
            <div className="lp-section-label">Capabilities</div>
            <h2 className="lp-section-heading">
              Everything you need to<br />
              <span className="lp-gradient-text">stay ahead of deadlines</span>
            </h2>
            <div className="lp-features__grid">

              <article className="lp-feature-card lp-fade-up" style={{"--delay":"0s"}}>
                <div className="lp-feature-card__icon">⚡</div>
                <h3 className="lp-feature-card__title">AI Task Prioritization</h3>
                <p className="lp-feature-card__desc">Automatically ranks your tasks by urgency, importance, and deadline proximity — so you always know what to tackle first.</p>
              </article>

              <article className="lp-feature-card lp-fade-up" style={{"--delay":"0.05s"}}>
                <div className="lp-feature-card__icon">🎯</div>
                <h3 className="lp-feature-card__title">Deadline Prediction</h3>
                <p className="lp-feature-card__desc">Learns your work patterns and predicts which tasks are at risk before they become urgent. No more last-minute scrambles.</p>
              </article>

              <article className="lp-feature-card lp-fade-up" style={{"--delay":"0.1s"}}>
                <div className="lp-feature-card__icon">📅</div>
                <h3 className="lp-feature-card__title">Smart Daily Planning</h3>
                <p className="lp-feature-card__desc">Generates an optimized daily schedule that accounts for your energy levels, task complexity, and available time blocks.</p>
              </article>

              <article className="lp-feature-card lp-fade-up" style={{"--delay":"0.15s"}}>
                <div className="lp-feature-card__icon">🗓️</div>
                <h3 className="lp-feature-card__title">Calendar Integration</h3>
                <p className="lp-feature-card__desc">Syncs with your existing calendar to find real gaps in your day, and blocks time for deep work without conflicts.</p>
              </article>

              <article className="lp-feature-card lp-fade-up" style={{"--delay":"0.2s"}}>
                <div className="lp-feature-card__icon">📊</div>
                <h3 className="lp-feature-card__title">Productivity Analytics</h3>
                <p className="lp-feature-card__desc">Visual insights into your completion rates, focus trends, and peak performance windows to help you improve over time.</p>
              </article>

              <article className="lp-feature-card lp-fade-up" style={{"--delay":"0.25s"}}>
                <div className="lp-feature-card__icon">🎧</div>
                <h3 className="lp-feature-card__title">Focus Mode</h3>
                <p className="lp-feature-card__desc">One-click deep work sessions with built-in timers, distraction blocking, and AI-powered progress nudges.</p>
              </article>

            </div>
          </section>

          {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
          <section className="lp-how" aria-label="How it works">
            <div className="lp-section-label">Process</div>
            <h2 className="lp-section-heading">
              Four steps from chaos<br />
              <span className="lp-gradient-text">to complete</span>
            </h2>
            <div className="lp-how__steps">

              <div className="lp-step lp-fade-up" style={{"--delay":"0s"}}>
                <div className="lp-step__num">01</div>
                <div className="lp-step__body">
                  <h3 className="lp-step__title">Add Your Tasks</h3>
                  <p className="lp-step__desc">Paste your to-do list, import from your tools, or just describe what you need to get done in plain English.</p>
                </div>
              </div>

              <div className="lp-step__connector" aria-hidden="true">
                <div className="lp-connector__line"></div>
              </div>

              <div className="lp-step lp-fade-up" style={{"--delay":"0.1s"}}>
                <div className="lp-step__num">02</div>
                <div className="lp-step__body">
                  <h3 className="lp-step__title">AI Understands Priorities</h3>
                  <p className="lp-step__desc">DeadlineZero analyzes context, deadlines, dependencies, and your past patterns to build a complete picture of your workload.</p>
                </div>
              </div>

              <div className="lp-step__connector" aria-hidden="true">
                <div className="lp-connector__line"></div>
              </div>

              <div className="lp-step lp-fade-up" style={{"--delay":"0.2s"}}>
                <div className="lp-step__num">03</div>
                <div className="lp-step__body">
                  <h3 className="lp-step__title">Smart Schedule Generated</h3>
                  <p className="lp-step__desc">Receive a day-by-day action plan that's realistic, buffer-aware, and guaranteed to get everything in before the clock runs out.</p>
                </div>
              </div>

              <div className="lp-step__connector" aria-hidden="true">
                <div className="lp-connector__line"></div>
              </div>

              <div className="lp-step lp-fade-up" style={{"--delay":"0.3s"}}>
                <div className="lp-step__num">04</div>
                <div className="lp-step__body">
                  <h3 className="lp-step__title">Finish Before Deadline</h3>
                  <p className="lp-step__desc">Execute with confidence. The AI monitors your progress and recalibrates in real time if anything shifts.</p>
                </div>
              </div>

            </div>
          </section>

          {/* ── AI DEMO ───────────────────────────────────────────────── */}
          <section className="lp-demo" aria-label="AI demo">
            <div className="lp-section-label">AI in Action</div>
            <h2 className="lp-section-heading">
              Ask it anything.<br />
              <span className="lp-gradient-text">It just handles it.</span>
            </h2>

            <div className="lp-chat">
              <div className="lp-chat__header">
                <span className="lp-pulse-dot"></span>
                <span className="lp-chat__title">DeadlineZero AI</span>
                <span className="lp-chat__status">Online</span>
              </div>

              <div className="lp-chat__messages">
                <div className="lp-msg lp-msg--user">
                  <div className="lp-msg__avatar lp-msg__avatar--user">U</div>
                  <div className="lp-msg__bubble lp-msg__bubble--user">
                    I have 8 assignments due this week and I don't know where to start.
                  </div>
                </div>

                <div className="lp-msg lp-msg--ai">
                  <div className="lp-msg__avatar lp-msg__avatar--ai">🤖</div>
                  <div className="lp-msg__bubble lp-msg__bubble--ai">
                    <p>I've analyzed all 8 assignments and built the optimal schedule. Here's your priority order:</p>
                    <div className="lp-ai-plan">
                      <div className="lp-ai-plan__row">
                        <span className="lp-ai-plan__badge lp-ai-plan__badge--1">1st</span>
                        <span>Database Assignment — highest urgency + most complexity</span>
                      </div>
                      <div className="lp-ai-plan__row">
                        <span className="lp-ai-plan__badge lp-ai-plan__badge--2">2nd</span>
                        <span>ML Report — due Thursday, needs 4h focus block</span>
                      </div>
                      <div className="lp-ai-plan__row">
                        <span className="lp-ai-plan__badge lp-ai-plan__badge--3">3rd</span>
                        <span>UI Design — can parallelize with review sessions</span>
                      </div>
                    </div>
                    <p className="lp-msg__note">Starting the DB assignment now gives you a 96% chance of finishing everything on time.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
          <section className="lp-testimonials" aria-label="Testimonials">
            <div className="lp-section-label">Social Proof</div>
            <h2 className="lp-section-heading">
              Students and professionals<br />
              <span className="lp-gradient-text">trust DeadlineZero</span>
            </h2>
            <div className="lp-testimonials__grid">

              <blockquote className="lp-tcard lp-fade-up" style={{"--delay":"0s"}}>
                <div className="lp-tcard__stars">★★★★★</div>
                <p className="lp-tcard__quote">"I went from missing 2–3 deadlines a month to a perfect streak for 60 days straight. The AI schedule is genuinely uncanny."</p>
                <footer className="lp-tcard__author">
                  <div className="lp-avatar lp-avatar--a">AR</div>
                  <div>
                    <div className="lp-tcard__name">Aryan Rao</div>
                    <div className="lp-tcard__role">CS Student, IIT Delhi</div>
                  </div>
                </footer>
              </blockquote>

              <blockquote className="lp-tcard lp-tcard--featured lp-fade-up" style={{"--delay":"0.1s"}}>
                <div className="lp-tcard__stars">★★★★★</div>
                <p className="lp-tcard__quote">"Our whole product team uses DeadlineZero. Sprint planning used to take 2 hours — now it's a 10-minute AI conversation."</p>
                <footer className="lp-tcard__author">
                  <div className="lp-avatar lp-avatar--b">SK</div>
                  <div>
                    <div className="lp-tcard__name">Shreya Kapoor</div>
                    <div className="lp-tcard__role">Product Lead, Bengaluru</div>
                  </div>
                </footer>
              </blockquote>

              <blockquote className="lp-tcard lp-fade-up" style={{"--delay":"0.2s"}}>
                <div className="lp-tcard__stars">★★★★★</div>
                <p className="lp-tcard__quote">"I was skeptical about another productivity tool. DeadlineZero is the first one that actually adapts to how I work instead of forcing me into a rigid system."</p>
                <footer className="lp-tcard__author">
                  <div className="lp-avatar lp-avatar--c">MJ</div>
                  <div>
                    <div className="lp-tcard__name">Marcus Johnson</div>
                    <div className="lp-tcard__role">Freelance Designer, London</div>
                  </div>
                </footer>
              </blockquote>

            </div>
          </section>

          {/* ── FINAL CTA ─────────────────────────────────────────────── */}
          <section className="lp-cta" aria-label="Call to action">
            <div className="lp-cta__glow" aria-hidden="true"></div>
            <div className="lp-section-label">Get Started</div>
            <h2 className="lp-cta__heading">
              Ready to take control<br />
              <span className="lp-gradient-text">of your deadlines?</span>
            </h2>
            <p className="lp-cta__sub">Join thousands of students and professionals who never miss a deadline. Free to start — no credit card needed.</p>
            <button className="lp-btn lp-btn--primary lp-btn--lg" onClick={() => navigate("/signup")}>
              <span>Get Started Free</span>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </section>

          {/* ── FOOTER ────────────────────────────────────────────────── */}
          <footer className="lp-footer" role="contentinfo">
            <div className="lp-footer__brand">
              <span className="lp-footer__logo">DeadlineZero</span>
              <span className="lp-footer__tagline">Never miss another deadline.</span>
            </div>
            <nav className="lp-footer__nav" aria-label="Footer navigation">
              <a href="https://github.com" className="lp-footer__link" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="#" className="lp-footer__link">Privacy</a>
              <a href="#" className="lp-footer__link">Contact</a>
            </nav>
            <p className="lp-footer__copy">© 2026 DeadlineZero. Built for the hackathon.</p>
          </footer>

        </section>
      </main>
    </div>
  );
}