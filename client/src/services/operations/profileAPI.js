import { apiConnector } from "../apiconnector";
import { profile } from "../apis";
import { setUser } from "../../slices/profileSlice";
import { clearToken } from "../../slices/authSlice";
import { toast } from "react-hot-toast";

export const updateProfile =
    ({ dob, gender, contactNo, about, setIsEditing, navigate }) =>
        async (dispatch, getState) => {
            const token = getState().auth.token; // new concept: read token from Redux state here
            try {
                console.log("START REQUEST");

                const response = await apiConnector(
                    "PUT",
                    profile.UPDATE_PROFILE,
                    { dob, gender, contactNo, about },
                    {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    }
                );

                console.log("RESPONSE RECEIVED", response);
                if (!response.data.success) {
                    toast.error(response.data.message);
                    return;
                }

                if (response.data.user) {
                    dispatch(setUser(response.data.user));
                }

                toast.success("Profile Updated");
            } catch (error) {
                console.log(error);
                console.log("CATCH BLOCK RUNNING");
                console.log("Status:", error?.response?.status);
                console.log("Message:", error?.response?.data);

                if (error?.response?.status === 401) {
                    dispatch(clearToken());
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    toast.error(
                        error?.response?.data?.message || "JWT expired. Please login again."
                    );
                    navigate?.("/login");
                    return;
                }

                toast.error(
                    error?.response?.data?.message || "Failed to update profile"
                );
            } finally {
                setIsEditing?.(false);
            }
        };

export const fetchEnrolledCourses = async (token, dispatch) => {
    let result = [];
    try {
        const response = await apiConnector("GET", profile.GET_ENROLLED_COURSES_API, null, {
            Authorization: `Bearer ${token}`,
        });

        console.log("GET ENROLLED COURSES API RESPONSE............", response);

        if (!response.data.success) {
            throw new Error(response.data.message);
        }

        result = response.data.data;
    } catch (error) {
        console.log("GET ENROLLED COURSES API ERROR............", error);
        toast.error(error?.response?.data?.message || "Could not fetch enrolled courses");
        if (error?.response?.status === 401) {
            // Handle JWT expiration/invalidity
            // This logic is already in studentFeaturesAPI.js, consider centralizing it if it becomes repetitive
        }
    }
    return result;
};
