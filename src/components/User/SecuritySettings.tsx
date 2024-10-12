import React, { useState } from 'react';

const SecuritySettings: React.FC = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password change logic here
  };

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
          type="password"
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
      <button
        type="submit"
        className="px-4 py-2 rounded button-hover"
        style={{ backgroundColor: 'var(--button-primary)' }}
      >
        Change Password
      </button>
    </form>
  );
};

export default SecuritySettings;
