import { apiConnector } from "../apiconnector";
import { toast } from "react-hot-toast";
import { ai } from "../apis";

export const regenerateDailyPlan = (token) => {
    return async () => {
        try {
            const response = await apiConnector(
                "POST",
                ai.DAILY_PLAN_REGENERATE,
                null,
                {
                    Authorization: `Bearer ${token}`,
                }
            );

            return response.data;
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to regenerate daily plan.");
            return null;
        }
    };
};

