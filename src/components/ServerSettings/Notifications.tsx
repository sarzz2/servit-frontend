import React, { useEffect, useState } from 'react';
import { Server } from '../../types/server';
import { useSnackbar } from '../Snackbar';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Store';
import axiosInstance from '../../utils/axiosInstance';
import { setNotificationPreference } from '../../slices/notificationSlice';

interface Notification {
  id: number;
  title: string;
  description: string;
}

interface OverviewProps {
  server: Server;
}

const Notifications: React.FC<OverviewProps> = ({ server }) => {
  const { showSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  // Get the raw notification preference for this server
  const rawPreference = useSelector(
    (state: RootState) => state.notification.preferences[server.id]
  );
  const preference = rawPreference || 'all';

  // Fetch the server's notification preference if it hasn't been fetched yet.
  useEffect(() => {
    const fetchNotificationPreference = async (serverId: string) => {
      try {
        const response = await axiosInstance.get(
          `/servers/notification/${serverId}`
        );
        if (response.data) {
          dispatch(
            setNotificationPreference({
              serverId,
              preference: response.data.notification_preference,
            })
          );
        }
      } catch (error) {
        console.error('Error fetching notification preference', error);
      }
    };

    if (rawPreference === undefined) {
      fetchNotificationPreference(server.id);
    }
  }, [dispatch, server.id, rawPreference]);

  // Options for notification settings.
  const notifications: Notification[] = [
    {
      id: 1,
      title: 'All',
      description: 'Receive notifications for all messages',
    },
    {
      id: 2,
      title: 'Mentions',
      description: 'Receive notifications only for mentions',
    },
    {
      id: 3,
      title: 'None',
      description: 'Do not receive any notifications',
    },
  ];

  // Determine the default selected notification based on the current preference.
  const defaultNotification =
    notifications.find(
      (n) => n.title.toLowerCase() === preference.toLowerCase()
    ) || notifications[0];

  const [selected, setSelected] = useState<number>(defaultNotification.id);

  // When the Redux preference changes, update the selected state accordingly.
  useEffect(() => {
    const updatedDefault = notifications.find(
      (n) => n.title.toLowerCase() === preference.toLowerCase()
    );
    if (updatedDefault) {
      setSelected(updatedDefault.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preference]);

  const handleChange = async (notification: Notification) => {
    try {
      await axiosInstance.post(
        `/servers/notification/${server.id}/${notification.title.toLowerCase()}`
      );
      dispatch(
        setNotificationPreference({
          serverId: server.id,
          preference: notification.title.toLowerCase() as
            | 'all'
            | 'mentions'
            | 'none',
        })
      );
      setSelected(notification.id);
      showSnackbar('Successfully updated notification preference', 'success');
    } catch (error) {
      console.error('Error updating notification preference', error);
      showSnackbar('Error updating notification preference', 'error');
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h1 className="text-2xl font-semibold mb-4">Notifications</h1>
      <div className="bg-bg-primary dark:bg-dark-primary p-4 rounded-lg shadow-lg w-full">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.map((notification) => (
            <div key={notification.id} className="py-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="notifications"
                  value={notification.id}
                  checked={selected === notification.id}
                  onChange={() => handleChange(notification)}
                  className="form-radio h-5 w-5 text-primary transition duration-150 ease-in-out dark:border-gray-600 dark:bg-gray-800"
                  disabled={
                    server.default_notification_setting === 'mentions' &&
                    notification.title.toLowerCase() === 'all'
                  }
                />
                <span className="ml-3 text-lg font-medium">
                  {notification.title}
                </span>
              </label>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {notification.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
