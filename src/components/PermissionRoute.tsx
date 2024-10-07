import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../Store';

interface PermissionRouteProps {
  children: JSX.Element;
  requiredPermissions: string[];
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({
  children,
  requiredPermissions,
}) => {
  const { permissions } = useSelector((state: RootState) => state.permissions);
  const permissionSet = new Set(
    permissions.map((permission) => permission.name)
  );

  // Check if user has any of the required permissions
  const hasPermission = requiredPermissions.some((permission) =>
    permissionSet.has(permission)
  );

  if (!hasPermission) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PermissionRoute;
