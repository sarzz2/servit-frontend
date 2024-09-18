import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { closeModal } from '../slices/authModalSlice';
import axiosInstance from '../utils/axiosInstance';
import Snackbar from './Snackbar';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../slices/userSlice';

interface LoginFormValues {
  username: string;
  password: string;
}

const loginSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: yupResolver(loginSchema) });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await axiosInstance.post('/users/login', data);
      const token = response.data.access_token;

      // Store token in localStorage
      localStorage.setItem('access_token', token);
      setSnackbar({ message: 'Login successful!', type: 'success' });
      dispatch(
        setUser({
          email: response.data.email,
          username: response.data.username,
        })
      );
      dispatch(closeModal());
      navigate('/user');
    } catch (error) {
      setSnackbar({
        message: 'Invalid username password.',
        type: 'error',
      });
    }
  };

  return (
    <div className="w-1/2 p-4">
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
      <h2
        className="text-xl font-bold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        Login
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Username
          </label>
          <input
            type="text"
            className={`w-full p-2 border rounded ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            }`}
            style={{ color: '#1f2937' }}
            {...register('username')}
          />
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )}
        </div>
        <div>
          <label
            className="block text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            Password
          </label>
          <input
            type="password"
            className={`w-full p-2 border rounded ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            style={{ color: '#1f2937' }}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
