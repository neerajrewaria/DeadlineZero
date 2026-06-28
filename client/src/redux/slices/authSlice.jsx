import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    token: localStorage.getItem('token') ? JSON.parse(localStorage.getItem('token')) : null,
    signupData: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,

    reducers: {
     setToken: (state, action) => {
    state.token = action.payload;

    localStorage.setItem(
      'token',
      JSON.stringify(action.payload)
    );
},
        clearToken: (state) => {
            state.token = null;
            localStorage.removeItem('token');
        },
        setSignupData: (state, action) => {
            state.signupData = action.payload;
        }
    }
});

export const { setToken, clearToken, setSignupData } = authSlice.actions;
export default authSlice.reducer;