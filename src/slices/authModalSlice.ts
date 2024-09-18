// src/store/slices/authModalSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthModalState {
  isOpen: boolean;
  type: 'login' | 'signup';
}

const initialState: AuthModalState = {
  isOpen: false,
  type: 'login',
};

const authModalSlice = createSlice({
  name: 'authModal',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<'login' | 'signup'>) => {
      state.isOpen = true;
      state.type = action.payload;
    },
    closeModal: (state) => {
      state.isOpen = false;
    },
  },
});

export const { openModal, closeModal } = authModalSlice.actions;
export default authModalSlice.reducer;
