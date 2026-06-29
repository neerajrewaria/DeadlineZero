import { useState } from "react";
import "./ForgotPassword.css";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetPasswordToken } from "../services/operations/resetPasswordAPI"; // adjust path

const ForgotPassword = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        dispatch(resetPasswordToken(email, navigate));
    };

    return (
        <div className="fp-wrapper">
            {/* ambient background glows */}
            <div className="fp-glow fp-glow-1" />
            <div className="fp-glow fp-glow-2" />

            <div className="fp-card">
                {/* brand mark */}
                <div className="fp-brand">
                    <div className="fp-brand-icon">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <span className="fp-brand-name">StudyNotion</span>
                </div>

                {/* heading */}
                <div className="fp-heading">
                    <h1 className="fp-title">Forgot your password?</h1>
                    <p className="fp-subtitle">
                        No worries, we'll send you reset instructions. Enter the email
                        address associated with your account.
                    </p>
                </div>

                {/* form (static, no logic) */}
                <div className="fp-form">
                    <div className="fp-field">
                        <label className="fp-label" htmlFor="fp-email">
                            Email address
                        </label>
                        <div className="fp-input-wrap">
                            <span className="fp-input-icon">
                                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16v16H4z" opacity="0" />
                                    <path d="M22 6 12 13 2 6" />
                                    <path d="M2 6h20v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" />
                                </svg>
                            </span>
                            <input
                                id="fp-email"
                                type="email"
                                className="fp-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="button" 
                    className="fp-submit-btn"  
                    onClick={handleSubmit}
                    >
                        <span>Send reset link</span>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </button>

                    <div className="fp-divider">
                        <span>or</span>
                    </div>

                    <button type="button" 
                    className="fp-secondary-btn"
                     onClick={() => navigate("/login")}
                     >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        <span>Back to login</span>
                    </button>
                </div>

                {/* status / info strip (static placeholder, not wired) */}
                <div className="fp-info-strip">
                    <span className="fp-info-icon">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    </span>
                    <span>
                        Didn't get an email? Check your spam folder or try again in a
                        few minutes.
                    </span>
                </div>
            </div>

            {/* footer note */}
            <p className="fp-footer-note">
                Need help? <span className="fp-footer-link">Contact support</span>
            </p>
        </div>
    );
};

export default ForgotPassword;
