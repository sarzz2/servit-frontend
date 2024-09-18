import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const UserPage: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await axiosInstance.get('/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserData(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchData();
  }, []);

  if (!userData) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">User Details</h1>
      <p>Email: {userData.email}</p>
      <p>Username: {userData.username}</p>
    </div>
  );
};

export default UserPage;
