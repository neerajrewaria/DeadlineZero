import { apiConnector } from "../apiconnector";
import { setToken, clearToken } from "../../redux/slices/authSlice";
import { setUser, clearUser } from "../../redux/slices/profileSlice";
import { auth } from "../apis";
import { toast } from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

export const login = (email, password, navigate) => async (dispatch) => {
  try {
      console.log("LOGIN URL:", auth.Log_IN);
    const response = await apiConnector(
      "post",
      `${auth.Log_IN}`,
      { email, password },
      { "Content-Type": "application/json" }
    );

    if (response?.data?.success) {
      dispatch(setToken(response.data.token));
      dispatch(setUser(response.data.user));
      localStorage.setItem("token", JSON.stringify(response.data.token));
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
      toast.success(response.data.message || "Logged in successfully");
    } else {
      toast.error(response?.data?.message || "Login failed");
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || "Login request failed");
  }
};


export const sendOTP = (email, navigate) => {
  return async (dispatch) => {
    try {
      const response = await apiConnector(
        "post",
        `${auth.SEND_OTP}`,
        { email },
        { "Content-Type": "application/json" }
      );

      if (response?.data?.success) {
        toast.success(response.data.message || "OTP sent successfully");
        if (navigate) {
          navigate("/verify-email");
        }
      } else {
        toast.error(response?.data?.message || "Unable to send OTP");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "OTP request failed");
    }
  };
};


export const signUP = (
  accountType,
  firstName,
  lastName,
  email,
  password,
  confpassword,
  otp,
  navigate) => {
  return async (dispatch) => {

    try {
      const response = await apiConnector(
        "post",
        `${auth.Sign_UP}`,
        {
          email,
          password,
          confpassword,
          otp,
          accountType,
          firstName,
          lastName

        },
        { "Content-Type": "application/json" }
      )

      if (response?.data?.success) {
        toast.success(response.data.message || "Account has created successfully");

        setTimeout(() => {
          toast.success("Please login in NCodeX..");
        }, 2000)
        // navigate("/login");
        setTimeout(() => {
          navigate("/login");
        }, 1000)
      }
      else {
        toast.error(response?.data?.message || "SignUP failed");
      }

    }

    catch (error) {
      toast.error(error?.response?.data?.message || "SignUP request Failed");
    }
  }
}












export const logout = (navigate) => {
  return async (dispatch, getState) => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) {
      return;
    }

    const token = getState().auth.token;

    try {
      // Call backend to clear token from DB and cookies
      if (token) {
        await apiConnector("POST", auth.LOGOUT_API || "/auth/logout", null, {
          Authorization: `Bearer ${token}`,
        });
      }

      dispatch(clearToken());
      dispatch(clearUser());

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      toast.success("Logged out successfully");
    } catch (error) {
      console.log("LOGOUT ERROR", error);
      toast.error("Could not logout");
    }
    if (navigate) navigate("/login"); // Ensure navigation happens regardless of API call success
  };
};


