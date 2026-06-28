import { useState } from "react"
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineMail,
  AiOutlineLock,
} from "react-icons/ai"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { login } from "../services/operations/authAPI"
import "./LoginForm.css"

function LoginForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const { email, password } = formData

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = (e) => {
    e.preventDefault()
    dispatch(login(email, password, navigate))
  }

  return (
    <div className="auth-page">
      {/* Animated background blobs */}
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-bg__blob auth-bg__blob--a" />
        <div className="auth-bg__blob auth-bg__blob--b" />
        <div className="auth-bg__blob auth-bg__blob--c" />
        <div className="auth-bg__grid" />
      </div>

      <main className="auth-card-wrap">
        <div className="auth-card">

          {/* Brand header */}
          <div className="auth-brand">
            <div className="auth-brand__icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="8" fill="url(#brand-grad)" />
                <path d="M8 20L14 8L20 20" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.2 16.4H17.8" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="brand-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5B5CE6"/>
                    <stop offset="1" stopColor="#7C3AED"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="auth-brand__text">
              <span className="auth-brand__name">Deadline<span>Zero</span></span>
              <span className="auth-brand__tagline">AI Productivity Companion</span>
            </div>
          </div>

          {/* Heading */}
          <div className="auth-heading">
            <h1 className="auth-heading__title">Welcome back 👋</h1>
            <p className="auth-heading__sub">
              Organize tasks, beat deadlines and let AI plan your day smarter.
            </p>
          </div>

          {/* Form — all logic identical */}
          <form onSubmit={handleOnSubmit} className="login-form">

            {/* Email */}
            <label className="form-field">
              <span className="form-field__label">
                Email Address <sup className="required">*</sup>
              </span>
              <div className="form-field__control">
                <AiOutlineMail className="form-field__icon" fontSize={18} />
                <input
                  required
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleOnChange}
                  placeholder="you@example.com"
                  className="form-field__input"
                />
              </div>
            </label>

            {/* Password */}
            <label className="form-field">
              <span className="form-field__label">
                Password <sup className="required">*</sup>
              </span>
              <div className="form-field__control">
                <AiOutlineLock className="form-field__icon" fontSize={18} />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={handleOnChange}
                  placeholder="Enter your password"
                  className="form-field__input has-trailing"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="form-field__toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible fontSize={20} />
                  ) : (
                    <AiOutlineEye fontSize={20} />
                  )}
                </button>
              </div>
              <Link to="/forgot-password" className="forgot-password">
                Forgot password?
              </Link>
            </label>

            <button type="submit" className="submit-btn">
              Sign In
            </button>

          </form>

          {/* Footer */}
          <p className="auth-footer">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="auth-footer__link">
              Create account
            </Link>
          </p>

        </div>
      </main>
    </div>
  )
}

export default LoginForm
