import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import taskReducer from './slices/taskSlice';
import notificationReducer from "./slices/notificationSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  task:taskReducer,
  notification: notificationReducer,
});

export default rootReducer;
