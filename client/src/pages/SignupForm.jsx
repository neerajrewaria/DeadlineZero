import { useState } from "react"
import { toast } from "react-hot-toast"
import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineMail,
  AiOutlineLock,
  AiOutlineUser,
} from "react-icons/ai"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"

import { sendOTP } from "../services/operations/authAPI"
import { setSignupData } from "../redux/slices/authSlice.jsx"
import "./SignupForm.css"

function SignupForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confpassword: "",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { firstName, lastName, email, password, confpassword } = formData

  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  const handleOnSubmit = (e) => {
    e.preventDefault()
    console.log(formData);
    if (password !== confpassword) {
      toast.error("Passwords Do Not Match")
      return
    }
    const signupData = { ...formData }

    dispatch(setSignupData(signupData))
    dispatch(sendOTP(email, navigate))

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confPassword: "",
    })
  }

  return (
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-bg__blob auth-bg__blob--a" />
        <div className="auth-bg__blob auth-bg__blob--b" />
        <div className="auth-bg__blob auth-bg__blob--c" />
        <div className="auth-bg__grid" />
      </div>

      <main className="auth-card-wrap">
        <div className="auth-card">

          {/* Brand */}
          <div className="auth-brand">
            <div className="auth-brand__icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="28" height="28" rx="8" fill="url(#su-brand-grad)" />
                <path d="M8 20L14 8L20 20" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.2 16.4H17.8" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="su-brand-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5B5CE6"/>
                    <stop offset="1" stopColor="#7C3AED"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="auth-brand__text">
              <span className="auth-brand__name">DeadlineZero</span>
              <span className="auth-brand__tagline">AI Productivity Companion</span>
            </div>
          </div>

          {/* Heading */}
          <div className="auth-heading">
            <h1 className="auth-heading__title">Create account</h1>
            <p className="auth-heading__sub">Start organizing smarter — your AI copilot is ready.</p>
          </div>

          {/* Form — all logic identical */}
          <div className="signup-wrapper">
            <form onSubmit={handleOnSubmit} className="signup-form">

              {/* Name row */}
              <div className="signup-row">
                <label className="signup-label">
                  <span className="signup-label-text">
                    First Name <sup className="signup-required">*</sup>
                  </span>
                  <div className="signup-field">
                    <AiOutlineUser className="signup-field-icon" />
                    <input
                      required
                      type="text"
                      name="firstName"
                      value={firstName}
                      onChange={handleOnChange}
                      placeholder="First name"
                      className="signup-input"
                    />
                  </div>
                </label>

                <label className="signup-label">
                  <span className="signup-label-text">
                    Last Name <sup className="signup-required">*</sup>
                  </span>
                  <div className="signup-field">
                    <AiOutlineUser className="signup-field-icon" />
                    <input
                      required
                      type="text"
                      name="lastName"
                      value={lastName}
                      onChange={handleOnChange}
                      placeholder="Last name"
                      className="signup-input"
                    />
                  </div>
                </label>
              </div>

              {/* Email */}
              <label className="signup-label">
                <span className="signup-label-text">
                  Email Address <sup className="signup-required">*</sup>
                </span>
                <div className="signup-field">
                  <AiOutlineMail className="signup-field-icon" />
                  <input
                    required
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleOnChange}
                    placeholder="you@example.com"
                    className="signup-input"
                  />
                </div>
              </label>

              {/* Password row */}
              <div className="signup-row">
                <label className="signup-label">
                  <span className="signup-label-text">
                    Password <sup className="signup-required">*</sup>
                  </span>
                  <div className="signup-field">
                    <AiOutlineLock className="signup-field-icon" />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      onChange={handleOnChange}
                      placeholder="Create password"
                      className="signup-input signup-input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="signup-eye-btn"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <AiOutlineEyeInvisible fontSize={20} /> : <AiOutlineEye fontSize={20} />}
                    </button>
                  </div>
                </label>

                <label className="signup-label">
                  <span className="signup-label-text">
                    Confirm Password <sup className="signup-required">*</sup>
                  </span>
                  <div className="signup-field">
                    <AiOutlineLock className="signup-field-icon" />
                    <input
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      name="confpassword"
                      value={confpassword}
                      onChange={handleOnChange}
                      placeholder="Confirm password"
                      className="signup-input signup-input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="signup-eye-btn"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <AiOutlineEyeInvisible fontSize={20} /> : <AiOutlineEye fontSize={20} />}
                    </button>
                  </div>
                </label>
              </div>

              <button type="submit" className="signup-submit-btn">
                Create Account
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="auth-footer">
            Already have an account?
            <Link to="/login" className="auth-footer__link">Sign In</Link>
          </p>

        </div>
      </main>
    </div>
  )
}

export default SignupForm
