import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationPreference = 'all' | 'none' | 'mentions';

interface NotificationsState {
  // Map server id to its notification preference
  preferences: { [serverId: string]: NotificationPreference };
  isLoading: boolean;
}

const initialState: NotificationsState = {
  preferences: {},
  isLoading: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotificationPreference: (
      state,
      action: PayloadAction<{
        serverId: string;
        preference: NotificationPreference;
      }>
    ) => {
      state.preferences[action.payload.serverId] = action.payload.preference;
    },
    startLoading: (state) => {
      state.isLoading = true;
    },
    finishLoading: (state) => {
      state.isLoading = false;
    },
  },
});

export const { setNotificationPreference, startLoading, finishLoading } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
