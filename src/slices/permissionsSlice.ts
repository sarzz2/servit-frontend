import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Permission } from '../types/permission';
import { Role } from '../types/role';

interface PermissionsState {
  serverId: string | null;
  roles: Role[];
  permissions: Permission[];
}

const initialState: PermissionsState = {
  serverId: null,
  roles: [],
  permissions: [],
};

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setPermissions: (state, action: PayloadAction<PermissionsState>) => {
      state.serverId = action.payload.serverId;
      state.roles = action.payload.roles;
      state.permissions = action.payload.permissions;
    },
    clearPermissions: (state) => {
      state.serverId = null;
      state.roles = [];
      state.permissions = [];
    },
  },
});

export const { setPermissions, clearPermissions } = permissionsSlice.actions;
export default permissionsSlice.reducer;
