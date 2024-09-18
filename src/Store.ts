import { configureStore } from '@reduxjs/toolkit';
import authModalReducer from './slices/authModalSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    authModal: authModalReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
