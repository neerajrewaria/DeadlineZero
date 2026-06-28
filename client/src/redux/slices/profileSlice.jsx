import { createSlice } from '@reduxjs/toolkit';

const parseStoredUser = () => {
    const stored = localStorage.getItem('user');
    if (!stored) return null;

    try {
        return JSON.parse(stored);
    } catch (error) {
        console.warn('Invalid stored user JSON, clearing localStorage user:', error);
        localStorage.removeItem('user');
        return null;
    }
};

const initialState = {
    user: parseStoredUser(),
};

const profileSlice = createSlice({
    name: 'profile',
    initialState: initialState,

    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        clearUser: (state) => {
            state.user = null;
            localStorage.removeItem('user');
        },
        updateUserProfile: (state, action) => {
            if (!state.user) return;
            state.user = {
                ...state.user,
                ...action.payload,
            };
            localStorage.setItem('user', JSON.stringify(state.user));
        },
    }
});

export const { setUser, clearUser,updateUserProfile} = profileSlice.actions;
export default profileSlice.reducer;