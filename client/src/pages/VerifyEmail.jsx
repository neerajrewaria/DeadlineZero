import { useEffect, useState } from "react";
import OtpInput from "react-otp-input";
import { Link } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { RxCountdownTimer } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { sendOTP, signUP } from "../services/operations/authAPI";
import { useNavigate } from "react-router-dom";
import './VerifyEmail.css'

function VerifyEmail() {
    const [otp, setOtp] = useState("");
    const [cooldown, setCooldown] = useState(30);
    const [resendLoading, setResendLoading] = useState(false);
    const { signupData, loading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        // Only allow access of this route when user has filled the signup form
        if (!signupData) {
            navigate("/signup");
            return;
        }

        // start cooldown because OTP is already sent when the user finished signup
        const timerId = setTimeout(() => setCooldown(30), 0);
        return () => clearTimeout(timerId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timerId = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [cooldown]);

    const handleResend = async () => {
        if (cooldown > 0 || resendLoading || !signupData?.email) return;
        setResendLoading(true);
        await dispatch(sendOTP(signupData.email));
        setResendLoading(false);
        setCooldown(30);
    };

    const handleVerifyAndSignup = (e) => {
        e.preventDefault();
        const {
            accountType,
            firstName,
            lastName,
            email,
            password,
            confpassword,
        } = signupData;

        dispatch(
            signUP(
                accountType,
                firstName,
                lastName,
                email,
                password,
                confpassword,
                otp,
                navigate
            )
        );
    };

    return (
        <div className="verify-email-container">
            {loading ? (
                <div>
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="verify-email-card">
                    <h1 className="verify-email-title">
                        Verify Email
                    </h1>

                    <p className="verify-email-text">
                        A verification code has been sent to you. Enter the code below
                    </p>

                    <form onSubmit={handleVerifyAndSignup}>
                        <OtpInput
                            value={otp}
                            onChange={setOtp}
                            numInputs={6}
                            renderInput={(props) => (
                                <input
                                    {...props}
                                    placeholder="-"
                                    className="otp-input-box"
                                />
                            )}
                            containerStyle={{
                                justifyContent: "space-between",
                                gap: "0 6px",
                            }}
                        />

                        <button
                            type="submit"
                            className="verify-email-btn"
                        >
                            Verify Email
                        </button>
                    </form>

                    <div className="verify-email-footer">
                        <Link to="/signup">
                            <p className="back-signup-link">
                                <BiArrowBack /> Back To Signup
                            </p>
                        </Link>

                        <div className="resend-otp-group">
                            <button
                                className="resend-otp-btn"
                                type="button"
                                disabled={cooldown > 0 || resendLoading}
                                onClick={handleResend}
                            >
                                <RxCountdownTimer />
                                {resendLoading ? "Sending..." : "Resend it"}
                            </button>
                            {cooldown > 0 ? (
                                <div className="resend-timer-text">
                                    Resend available in {cooldown}s
                                </div>
                            ) : (
                                <div className="resend-timer-text">
                                    You can resend your OTP now.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}

export default VerifyEmail;
