// src/slices/onlineStatusSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../Store';

interface OnlineStatusState {
  onlineUsers: { [key: string]: boolean }; // Mapping of user IDs to their online status
}

const initialState: OnlineStatusState = {
  onlineUsers: {},
};

const onlineStatusSlice = createSlice({
  name: 'onlineStatus',
  initialState,
  reducers: {
    setUserOnlineStatus: (
      state,
      action: PayloadAction<{ userId: string; status: boolean }>
    ) => {
      state.onlineUsers[action.payload.userId] = action.payload.status;
    },
  },
});

export const { setUserOnlineStatus } = onlineStatusSlice.actions;

export const selectOnlineUsers = (state: RootState) =>
  state.onlineStatus.onlineUsers;

export default onlineStatusSlice.reducer;
