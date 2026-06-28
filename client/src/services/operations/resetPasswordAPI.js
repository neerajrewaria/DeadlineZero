import { apiConnector } from "../apiconnector";
import { setToken, clearToken } from "../../redux/slices/authSlice";
import { setUser, clearUser } from "../../redux/slices/profileSlice";
import { toast } from "react-hot-toast";
import { resetpasswordEndpoints } from '../apis'


export const resetPasswordToken = (email, navigate) => async (dispatch) => {
    try {

        const response = await apiConnector(
            "POST",
            resetpasswordEndpoints.RESETPASSWORD_TOKEN_API,
            { email }
        );

        if (!response?.data?.success) {
            throw new Error(response.data.message);
        }

        toast.success("Reset email sent successfully");

        navigate("/check-email",{
              state:{email}
        });

    }
    catch (error) {

        toast.error(
            error?.response?.data?.message ||
            "Failed to send reset email"
        );
    }
};

export const resetPassword =
    (password, confirmPassword, token, navigate) =>
        async (dispatch) => {

            try {
                     console.log({
    password,
    confirmpassword: confirmPassword,
    token
});
                const response = await apiConnector(
                    "POST",
                    resetpasswordEndpoints.RESETPASSWORD_API,
                    {
                        password,
                        confirmpassword: confirmPassword,
                        token
                    }
                );

                if (!response?.data?.success) {
                    throw new Error(response.data.message);
                }

                toast.success(
                    response.data.message ||
                    "Password reset successful"
                );

                navigate("/login");

            }
            catch (error) {

                console.log("RESET PASSWORD ERROR", error);

                toast.error(
                    error?.response?.data?.message ||
                    "Unable to reset password"
                );
            }
        };