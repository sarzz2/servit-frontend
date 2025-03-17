import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectedChannelState {
  id: string | null;
  name: string | null;
}

const initialState: SelectedChannelState = {
  id: null,
  name: null,
};

const selectedChannelSlice = createSlice({
  name: 'selectedChannel',

  initialState,

  reducers: {
    selectChannel(
      state,
      action: PayloadAction<{ id: string | null; name: string | null }>
    ) {
      state.id = action.payload.id;

      state.name = action.payload.name;
    },
  },
});

export const { selectChannel } = selectedChannelSlice.actions;

export default selectedChannelSlice.reducer;
