import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../Snackbar';

const SecuritySettings: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
  const [confirmNewPasswordMessage, setConfirmNewPasswordMessage] =
    useState('');
  const [isMessageDisable, setIsMessageDisable] = useState<boolean>(true);
  const [isMessageColorRed, setisMessageColorRed] = useState<boolean>(true);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e);
    setPasswordData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    const { currentPassword, newPassword, confirmNewPassword } = passwordData;

    // Check if all passwords are filled and match
    if (currentPassword && newPassword && confirmNewPassword) {
      if (confirmNewPassword === newPassword) {
        setIsButtonDisabled(false);
        setConfirmNewPasswordMessage('Password matches');
        setisMessageColorRed(false);
      } else {
        setConfirmNewPasswordMessage('Password does not match');
        setisMessageColorRed(true);
      }
    } else {
      setIsButtonDisabled(true); // Disable the button if conditions are not met
    }
  }, [passwordData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    axiosInstance
      .patch(
        '/users/change_password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmNewPassword: passwordData.confirmNewPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('sudo_token')}`,
          },
        }
      )
      .then((response) => {
        showSnackbar('Password change Successfully', 'success');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      })
      .catch((error) => {
        showSnackbar(error.response.data.detail, 'error');
        console.error('Error updating user information', error);
      });
    // Handle password change logic here
  };

  useEffect(() => {
    if (localStorage.getItem('sudo_token') == null) {
      navigate('/login/true');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          Current Password
        </label>
        <input
          type="password"
          name="currentPassword"
          value={passwordData.currentPassword}
          onChange={handleChange}
          className="w-full p-2 border-none rounded"
          style={{
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-secondary)',
          }}
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          New Password
        </label>
        <input
          type="text"
          name="newPassword"
          value={passwordData.newPassword}
          onChange={handleChange}
          className="w-full p-2 border-none rounded"
          style={{
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-secondary)',
          }}
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          Confirm New Password
        </label>
        <input
          type="text"
          name="confirmNewPassword"
          value={passwordData.confirmNewPassword}
          onChange={handleChange}
          onKeyDown={() => setIsMessageDisable(false)}
          className="w-full p-2 border-none rounded"
          style={{
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-secondary)',
          }}
        />
        <div
          className={`mt-2 text-xs ${isMessageColorRed ? 'text-red-500' : 'text-green-600'} ${isMessageDisable ? 'hidden' : 'block'}`}
        >
          {confirmNewPasswordMessage}
        </div>
      </div>
      <button
        type="submit"
        className="px-4 py-2 rounded button-hover bg-button-primary disabled:bg-gray-500 disabled:cursor-not-allowed"
        disabled={isButtonDisabled}
      >
        Change Password
      </button>
    </form>
  );
};

export default SecuritySettings;
