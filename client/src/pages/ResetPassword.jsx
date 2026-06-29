import { useState } from "react";
import "./ResetPassword.css";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../services/operations/resetPasswordAPI";

const ResetPassword = () => {
   console.log("pass 1");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const location = useLocation();

const token = new URLSearchParams(location.search).get("token");

console.log(token);

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });

    const { password, confirmPassword } = formData;

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };
console.log({
    password,
    confirmpassword: confirmPassword,
    token
});

 const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(
        resetPassword(
            password,
            confirmPassword,
            token,
            navigate
        )
    );

};
    console.log(token);


    return (
        <div className="rp-wrapper">
            <div className="rp-glow rp-glow-1"></div>
            <div className="rp-glow rp-glow-2"></div>

            <div className="rp-card">

                <div className="rp-brand">
                    <div className="rp-brand-icon">
                        🔒
                    </div>
                    <span className="rp-brand-name">StudyNotion</span>
                </div>

                <div className="rp-heading">
                    <h1 className="rp-title">Choose New Password</h1>

                    <p className="rp-subtitle">
                        Almost done! Enter your new password below and confirm it.
                    </p>
                </div>

                <form className="rp-form"   onSubmit={handleSubmit}>

                    <div className="rp-field">
                        <label className="rp-label">
                            New Password
                        </label>

                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={handleChange}
                            className="rp-input"
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className="rp-field">
                        <label className="rp-label">
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={handleChange}
                            className="rp-input"
                            placeholder="Confirm password"
                        />
                    </div>

                    <button className="rp-btn"  type="submit">
                        Reset Password
                    </button>

                </form>

            </div>
        </div>
    );
};

export default ResetPassword;
