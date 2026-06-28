const BASE_URL = import.meta.env.VITE_BASE_URL;

console.log("BASE_URL:", BASE_URL);
export const auth = {
     SEND_OTP: `${BASE_URL}/auth/sendOTP`,
     Sign_UP: `${BASE_URL}/auth/signup`,
     Log_IN: `${BASE_URL}/auth/login`,
     LOGOUT_API: `${BASE_URL}/auth/logout`
}

export const profile = {
     UPDATE_PROFILE: `${BASE_URL}/profile/updateProfile`,
     DELETE_PROFILE: `${BASE_URL}/profile/deleteProfile`,
    

}

export const task = {
  GET_ALL_TASKS: `${BASE_URL}/tasks`,
  GET_DASHBOARD_STATS: `${BASE_URL}/tasks/dashboard`,
  COMPLETE_TASK: `${BASE_URL}/tasks`,
};
export const ai = {
  CREATE_TASK_AI: `${BASE_URL}/ai/create-task`,
  DAILY_PLAN: `${BASE_URL}/ai/daily-plan`,
};

export const resetpasswordEndpoints = {
    RESETPASSWORD_TOKEN_API:
        BASE_URL + "/reset/reset-password-token",

    RESETPASSWORD_API:
        BASE_URL + "/reset/reset-password"
}