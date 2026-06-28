import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../services/operations/authAPI";
import "./Sidebar.css";

const NAV_ITEMS = [
  { id: "hero",      icon: "⬡", label: "Dashboard",    section: "hero"      },
  { id: "stats",     icon: "◈", label: "Statistics",   section: "stats"     },
  { id: "generator", icon: "✦", label: "AI Generator", section: "generator" },
  { id: "planner",   icon: "◎", label: "AI Planner",   section: "planner"   },
  { id: "tasks",     icon: "❖", label: "Tasks",        section: "tasks"     },
];

function Sidebar() {
  const dispatch               = useDispatch();
  const { token }              = useSelector((state) => state.auth);
  const { user }               = useSelector((state) => state.profile);
  const [active, setActive]    = useState("hero");
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setActive(sectionId);
    setMobileOpen(false);
  };

  useEffect(() => {
    const sections = NAV_ITEMS.map((n) => document.getElementById(n.section)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { threshold: 0.35 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => sections.forEach((s) => observer.unobserve(s));
  }, []);

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "U";

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sb-mobile-toggle"
        onClick={() => setMobileOpen((o) => !o)}
        aria-label="Toggle sidebar"
      >
        <span className="sb-mobile-toggle__bar" />
        <span className="sb-mobile-toggle__bar" />
        <span className="sb-mobile-toggle__bar" />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="sb-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sb-wrap${mobileOpen ? " sb-wrap--open" : ""}`}>
        {/* Background layers */}
        <div className="sb-bg-orb sb-bg-orb--1" />
        <div className="sb-bg-orb sb-bg-orb--2" />
        <div className="sb-aurora" />
        <div className="sb-border-beam" />

        {/* Particles */}
        <div className="sb-particles">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="sb-particle" />
          ))}
        </div>

        <div className="sb-inner">

          {/* ── Logo ── */}
          <div className="sb-logo">
            <div className="sb-logo__orb-wrap">
              <div className="sb-logo__ring sb-logo__ring--outer" />
              <div className="sb-logo__ring sb-logo__ring--inner" />
              <div className="sb-logo__core">
                <span className="sb-logo__icon">✦</span>
                <div className="sb-logo__pulse" />
              </div>
            </div>
            <div className="sb-logo__text">
              <h1 className="sb-logo__title">
                Deadline<span className="sb-logo__grad">Zero</span>
              </h1>
              <div className="sb-logo__badges">
                <span className="sb-badge sb-badge--ai">
                  <span className="sb-badge__dot" />
                  AI Powered
                </span>
              </div>
            </div>
          </div>

          <div className="sb-divider" />

          {/* ── Navigation ── */}
          <nav className="sb-nav">
            <p className="sb-nav__label">Navigation</p>
            <ul className="sb-nav__list">
              {NAV_ITEMS.map((item) => {
                const isActive = active === item.section;
                return (
                  <li key={item.id}>
                    <button
                      className={`sb-nav__item${isActive ? " sb-nav__item--active" : ""}`}
                      onClick={() => scrollToSection(item.section)}
                    >
                      {isActive && <div className="sb-nav__item-glow" />}
                      {isActive && <div className="sb-nav__item-beam" />}
                      <span className="sb-nav__item-accent" />
                      <span className="sb-nav__item-icon">{item.icon}</span>
                      <span className="sb-nav__item-label">{item.label}</span>
                      {isActive && (
                        <span className="sb-nav__item-indicator" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="sb-spacer" />

          {/* ── User + Logout ── */}
          <div className="sb-bottom">
            <div className="sb-user">
              <div className="sb-user__avatar">
                <span className="sb-user__initials">{initials}</span>
                <span className="sb-user__online" />
              </div>
              <div className="sb-user__info">
                <p className="sb-user__name">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="sb-user__role">AI Member</p>
              </div>
            </div>

            <button
              className="sb-logout-btn"
              onClick={() => dispatch(logout(token))}
            >
              <span className="sb-logout-btn__glow" />
              <span className="sb-logout-btn__shine" />
              <span className="sb-logout-btn__content">
                <span className="sb-logout-btn__icon">⏻</span>
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;