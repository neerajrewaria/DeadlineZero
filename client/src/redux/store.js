import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducer.jsx';
const store = configureStore({
  reducer: rootReducer,

});

export default store;