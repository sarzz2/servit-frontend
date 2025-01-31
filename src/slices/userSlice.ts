import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: {
    id: string;
    email: string;
    username: string;
    profilePicture?: string;
  } | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  isAuthLoading: true,
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        id: string;
        email: string;
        username: string;
        profilePicture: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.isAuthLoading = false;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.isAuthLoading = false;
      state.user = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('sudo_token');
    },
    startLoading(state) {
      state.isAuthLoading = true;
    },
    finishLoading(state) {
      state.isAuthLoading = false;
    },
  },
});

export const { setUser, logout, finishLoading } = userSlice.actions;
export default userSlice.reducer;
