import { configureStore } from '@reduxjs/toolkit';
import authModalReducer from './slices/authModalSlice';
import userReducer from './slices/userSlice';
import selectedServerReducer from './slices/selectedServerSlice';
import selectedChannelReducer from './slices/selectedChannelSlice';
import permissionsReducer from './slices/permissionsSlice';
import onlineStatusReducer from './slices/onlineStatusSlice';
import wsSliceReducer from './slices/wsSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    authModal: authModalReducer,
    user: userReducer,
    selectedServer: selectedServerReducer,
    selectedChannel: selectedChannelReducer,
    notification: notificationReducer,
    permissions: permissionsReducer,
    onlineStatus: onlineStatusReducer,
    ws: wsSliceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['ws.connection'],
        ignoredActions: ['ws/setConnection'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
