import React from 'react';
import Login from '../components/Auth/Login';
import { useParams } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { sudo } = useParams<{ sudo: string }>();
  let isSudoAccess: boolean = false;

  if (sudo === 'true') {
    isSudoAccess = true;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-tertiary dark:bg-dark-tertiary">
      <Login sudo={isSudoAccess} />
    </div>
  );
};

export default LoginPage;
