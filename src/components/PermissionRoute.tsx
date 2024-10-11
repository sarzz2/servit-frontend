import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setPermissions } from '../slices/permissionsSlice';
import { useSnackbar } from './Snackbar';
import { RootState } from '../Store';
import axiosInstance from '../utils/axiosInstance';

interface PermissionRouteProps {
  children: JSX.Element;
  requiredPermissions: string[];
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({
  children,
  requiredPermissions,
}) => {
  const { permissions } = useSelector((state: RootState) => state.permissions);
  const [isLoading, setIsLoading] = useState(true);
  const permissionSet = new Set(
    permissions.map((permission) => permission.name)
  );
  const { showSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { serverId } = useParams();

  useEffect(() => {
    console.log('Fetching permissions');
    axiosInstance
      .get(`/servers/${serverId}/roles_permissions`)
      .then((response) => {
        dispatch(setPermissions(response.data));
      })
      .catch((error) => {
        console.error(error);
        showSnackbar('Error loading permissions', 'error');
      });
    if (permissions.length > 0) {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasPermission = requiredPermissions.some((permission) =>
    permissionSet.has(permission)
  );

  if (isLoading) {
    // Show a loading state while permissions are being fetched
    return <div>Loading...</div>;
  }

  if (!hasPermission) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PermissionRoute;
