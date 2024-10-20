import React from 'react';
import Login from '../components/Auth/Login';

const LoginPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-tertiary dark:bg-dark-tertiary">
      <Login />
    </div>
  );
};

export default LoginPage;
