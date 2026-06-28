import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import "./Navbar.css";

function Navbar() {
  const { token } = useSelector((state) => state.auth);
  const [navbar__scrolled, setNavbar__scrolled] = useState(false);
  const [navbar__menuOpen, setNavbar__menuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setNavbar__scrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setNavbar__menuOpen((prev) => !prev);
  const closeMenu = () => setNavbar__menuOpen(false);

  return (
    <div className={`navbar__wrapper${navbar__scrolled ? " navbar__wrapper--scrolled" : ""}`}>
      <nav className="navbar__container">

        {/* ── Logo ── */}
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          <span className="navbar__logo-deadline">Deadline</span>
          <span className="navbar__logo-zero">Zero</span>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <div className="navbar__links-desktop">
          <a href="#features" className="navbar__nav-link">Features</a>
          <a href="#how-it-works" className="navbar__nav-link">How it Works</a>
          <a href="#ai-planner" className="navbar__nav-link">AI Planner</a>
        </div>

        {/* ── Desktop CTA Buttons ── */}
        <div className="navbar__actions-desktop">
          {!token ? (
            <>
              <Link to="/login" className="navbar__btn navbar__btn--ghost">
                Login
              </Link>
              <Link to="/signup" className="navbar__btn navbar__btn--primary">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="navbar__btn navbar__btn--primary">
                Dashboard
              </Link>
              <button className="navbar__btn navbar__btn--notify">
                <span className="navbar__notify-dot" />
                Notifications
              </button>
            </>
          )}
        </div>

        {/* ── Hamburger ── */}
        <button
          className={`navbar__hamburger${navbar__menuOpen ? " navbar__hamburger--open" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={navbar__menuOpen}
        >
          <span className="navbar__hamburger-bar" />
          <span className="navbar__hamburger-bar" />
          <span className="navbar__hamburger-bar" />
        </button>
      </nav>

      {/* ── Mobile Drawer ── */}
      <div className={`navbar__mobile-drawer${navbar__menuOpen ? " navbar__mobile-drawer--open" : ""}`}>
        <div className="navbar__mobile-links">
          <a href="#features" className="navbar__mobile-link" onClick={closeMenu}>Features</a>
          <a href="#how-it-works" className="navbar__mobile-link" onClick={closeMenu}>How it Works</a>
          <a href="#ai-planner" className="navbar__mobile-link" onClick={closeMenu}>AI Planner</a>
        </div>
        <div className="navbar__mobile-actions">
          {!token ? (
            <>
              <Link to="/login" className="navbar__btn navbar__btn--ghost navbar__btn--full" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/signup" className="navbar__btn navbar__btn--primary navbar__btn--full" onClick={closeMenu}>
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="navbar__btn navbar__btn--primary navbar__btn--full" onClick={closeMenu}>
                Dashboard
              </Link>
              <button className="navbar__btn navbar__btn--notify navbar__btn--full" onClick={closeMenu}>
                <span className="navbar__notify-dot" />
                Notifications
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
