import { configureStore } from '@reduxjs/toolkit';
import authModalReducer from './slices/authModalSlice';
import userReducer from './slices/userSlice';
import selectedServerReducer from './slices/selectedServerSlice';
import permissionsReducer from './slices/permissionsSlice';
import onlineStatusReducer from './slices/onlineStatusSlice';

export const store = configureStore({
  reducer: {
    authModal: authModalReducer,
    user: userReducer,
    selectedServer: selectedServerReducer,
    permissions: permissionsReducer,
    onlineStatus: onlineStatusReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
