import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setPermissions } from '../slices/permissionsSlice';
import { useSnackbar } from './Snackbar';
import { RootState } from '../Store';
import { fetchPermissions } from '../utils/fetchPermissions';
import { JSX } from 'react/jsx-runtime';

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
    const loadPermissions = async () => {
      try {
        const permissions = await fetchPermissions(serverId);
        dispatch(setPermissions(permissions));
      } catch (error) {
        console.error(error);
        showSnackbar('Error loading permissions', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadPermissions();
  }, [dispatch, serverId, showSnackbar]);

  const hasPermission = requiredPermissions.some((permission) =>
    permissionSet.has(permission)
  );

  if (isLoading) {
    // Show a loading state while permissions are being fetched
    return <div>Loading...</div>;
  }

  if (!hasPermission) {
    showSnackbar('You do not have access to this page', 'error');
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default PermissionRoute;
