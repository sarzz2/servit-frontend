import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectedServerState {
  id: string | null;
  name: string | null;
}

const initialState: SelectedServerState = {
  id: null,
  name: null,
};

const selectedChannelSlice = createSlice({
  name: 'selectedServer',

  initialState,

  reducers: {
    selectServer(state, action: PayloadAction<{ id: string; name: string }>) {
      state.id = action.payload.id;

      state.name = action.payload.name;
    },
  },
});

export const { selectServer } = selectedChannelSlice.actions;

export default selectedChannelSlice.reducer;
