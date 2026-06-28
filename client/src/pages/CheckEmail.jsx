import React from "react";
import { useNavigate } from "react-router-dom";
import "./CheckEmail.css";
import { useLocation } from "react-router-dom";

function CheckEmail() {

    const navigate = useNavigate();
    const location = useLocation();

  const email = location.state?.email;

    return (
        <div className="check-email-wrapper">

            <div className="email-glow email-glow-1"></div>
            <div className="email-glow email-glow-2"></div>

            <div className="check-email-card">

                <div className="mail-icon">
                    📩
                </div>

                <h1 className="check-email-title">
                    Check your email
                </h1>

                <p className="check-email-subtitle">
                    We've sent reset instructions to
                    <br />
                    <strong>{email}</strong>
                </p>

                <div className="email-info-box">
                    <p>
                        Didn't receive an email?
                    </p>

                    <ul>
                        <li>Check your spam folder.</li>
                        <li>Wait a few minutes.</li>
                        <li>Try resending the email.</li>
                    </ul>
                </div>

                <button className="resend-button">
                    Resend Email
                </button>

                <button
                    className="back-login-button"
                    onClick={() => navigate("/login")}
                >
                    ← Back to Login
                </button>

            </div>

        </div>
    );
}

export default CheckEmail;