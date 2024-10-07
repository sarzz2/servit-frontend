import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';

const PersonalInformation: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updated Information:', formData);
    // Add logic to update user information here if needed
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          Username
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
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
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
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
        Save Changes
      </button>
    </form>
  );
};

export default PersonalInformation;
