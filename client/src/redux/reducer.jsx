import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import taskReducer from './slices/taskSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  task:taskReducer
});

export default rootReducer;
