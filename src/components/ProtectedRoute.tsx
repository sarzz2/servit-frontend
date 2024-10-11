import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../Store';

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  const isAuthLoading = useSelector(
    (state: RootState) => state.user.isAuthLoading
  ); // Assuming you have a loading state for authentication
  if (isAuthLoading) {
    // You can replace this with a spinner or another UI component for loading
    return <div>Loading</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
