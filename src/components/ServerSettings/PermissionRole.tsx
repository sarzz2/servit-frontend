import React, { useEffect, useState } from 'react';
import { Server } from '../../types/server';
import { Permission } from '../../types/permission';
import axiosInstance from '../../utils/axiosInstance';
import { Role } from '../../types/role';

interface PermissionRoleProps {
  allPermissions: Permission[];
  selectedPermissions: string[];
  handleChangeEditRoleData: (key: keyof Role, value: any) => void;
}

const PermissionRole: React.FC<PermissionRoleProps> = ({
  allPermissions,
  selectedPermissions,
  handleChangeEditRoleData,
}) => {
  console.log('selectedPermiss', selectedPermissions);
  return (
    <div className="grid grid-cols-2 gap-6">
      {allPermissions &&
        allPermissions.map((permission) => (
          <div className="flex justify-between items-center">
            <span className="text-md">
              {permission.name
                .split('_')
                .map(
                  (word: string) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(' ')}
            </span>
            <label className="relative inline-block w-10 h-6">
              <input
                type="checkbox"
                checked={selectedPermissions.includes(permission.id)}
                onChange={() =>
                  handleChangeEditRoleData('permissions', {
                    id: permission.id,
                    name: permission.name,
                  })
                }
                className="sr-only peer cursor-pointer"
              />
              <div className="w-10 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors duration-300"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-4"></div>
            </label>
          </div>
        ))}
    </div>
  );
};

export default PermissionRole;
