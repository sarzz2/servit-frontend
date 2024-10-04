import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { closeModal } from '../../slices/authModalSlice';
import { XMarkIcon } from '@heroicons/react/20/solid';
import Login from './Login';
import Register from './Register';

const AuthPopup: React.FC = () => {
  const dispatch = useDispatch();
  const { isOpen, type } = useSelector((state: RootState) => state.authModal);
  const isLogin = type === 'login';

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(closeModal());
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-[900px] flex"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={() => dispatch(closeModal())}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        {isLogin ? <Login /> : <Register />}
      </div>
    </div>
  );
};

export default AuthPopup;
