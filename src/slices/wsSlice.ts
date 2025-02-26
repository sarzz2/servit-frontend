import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ChatType = 'channel' | 'dm';

export interface ActiveChat {
  chat_type: ChatType;
  chat_id: string;
}

interface WSState {
  connection: WebSocket | null;
  activeChat: ActiveChat | null;
  lastVisitedChat: ActiveChat | null;
}

const initialState: WSState = {
  connection: null,
  activeChat: null,
  lastVisitedChat: null,
};

const wsSlice = createSlice({
  name: 'ws',
  initialState,
  reducers: {
    setConnection(state, action: PayloadAction<WebSocket>) {
      state.connection = action.payload;
    },
    clearConnection(state) {
      state.connection = null;
    },
    setActiveChat(state, action: PayloadAction<ActiveChat>) {
      state.activeChat = action.payload;
      state.lastVisitedChat = action.payload;
    },
    // In case you need to clear the active chat (will fall back to last visited)
    clearActiveChat(state) {
      state.activeChat = state.lastVisitedChat;
    },
  },
});

export const {
  setConnection,
  clearConnection,
  setActiveChat,
  clearActiveChat,
} = wsSlice.actions;
export default wsSlice.reducer;
