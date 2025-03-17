import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useSnackbar } from '../Snackbar';
import { useDispatch, useSelector } from 'react-redux';
import { selectServer } from '../../slices/selectedServerSlice';
import { useNavigate } from 'react-router-dom';
import CreateServerModal from '../Common/CreateServerModal';
import eventEmitter from '../../utils/eventEmitter';
import { useNotifications } from '../../contexts/NotificationProvider';
import { selectChannel } from '../../slices/selectedChannelSlice';
import { RootState } from '../../Store';
import { setNotificationPreference } from '../../slices/notificationSlice';

const ServerList: React.FC = () => {
  const [servers, setServers] = useState<
    {
      server_picture_url: string;
      id: string;
      name: string;
    }[]
  >([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { notifications } = useNotifications();
  const dispatch = useDispatch();

  // Get the per-server notification preferences from Redux
  const serverPreferences = useSelector(
    (state: RootState) => state.notification.preferences
  );

  useEffect(() => {
    fetchServers();
    eventEmitter.on('leaveServer', handleMyEvent);
    return () => {
      eventEmitter.off('leaveServer', handleMyEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMyEvent = (data: any) => {
    setServers((prevServers) =>
      prevServers.filter((server) => server.id !== data.serverId)
    );
  };

  const fetchServers = async () => {
    try {
      const response = await axiosInstance.get('/servers/user_servers');
      const servers = response.data.servers;
      setServers(servers);
      console.log(servers);
      // Fetch notification preferences for each server
      for (const server of servers) {
        dispatch(
          setNotificationPreference({
            serverId: server.id,
            preference: server.default_notification_setting || 'all',
          })
        );
      }
    } catch (error) {
      console.error(error);
      showSnackbar('Error loading servers', 'error');
    }
  };

  const handleSelectServer = async (serverId: string, serverName: string) => {
    dispatch(selectServer({ id: serverId, name: serverName }));
    dispatch(selectChannel({ id: null, name: null }));
    navigate(`/home/${serverId}`);
  };

  return (
    <div className="flex">
      <div className="w-16 h-screen flex flex-col items-center py-4 bg-bg-secondary dark:bg-dark-secondary">
        <button
          className="w-12 h-12 mt-2 rounded-full flex items-center justify-center bg-bg-primary dark:bg-dark-primary dark:text-dark-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover"
          onClick={() => {
            navigate('/home/direct');
            dispatch(selectServer({ id: '', name: '' }));
          }}
        >
          DM
        </button>
        <hr className="w-3/4 mt-2 bg-bg-primary dark:bg-dark-primary" />

        {/* Server icons */}
        {servers.map((server) => {
          // Retrieve the notification preference for this server from the mapping,
          const serverPreference = serverPreferences[server.id] || 'all';

          const serverNotification = notifications[server.id];
          // Calculate the total unread count for the server:
          const totalCount = serverNotification
            ? serverNotification.serverCount
            : 0;

          // Calculate the sum of unread mentions for this server.
          const mentionCount = serverNotification
            ? Object.values(serverNotification.channels).reduce(
                (acc, channelData) =>
                  acc +
                  (channelData.events
                    .filter((e) => e.type === 'mention')
                    .slice(-1)[0]?.unread || 0),
                0
              )
            : 0;

          // Determine which count to show based on the server's preference.
          let notificationCount = 0;
          if (serverPreference === 'all') {
            notificationCount = totalCount;
          } else if (
            serverPreference === 'mentions' ||
            serverPreference === 'none'
          ) {
            notificationCount = mentionCount;
          }

          // Highlight if there is any unread notification.
          const showHighlight = totalCount > 0;

          return (
            <div key={server.id} className="relative">
              <button
                className={`w-12 h-12 mt-2 rounded-full flex items-center justify-center bg-bg-primary text-text-primary dark:bg-dark-primary dark:text-dark-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover ${
                  showHighlight ? 'ring-2 ring-red-500' : ''
                }`}
                onClick={() => handleSelectServer(server.id, server.name)}
              >
                {server.server_picture_url ? (
                  <img
                    src={server.server_picture_url}
                    alt={server.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  server.name[0].toUpperCase()
                )}
              </button>
              {/* Always show the counter badge if notificationCount is non-zero */}
              {notificationCount > 0 && (
                <span className="absolute bottom-0 right-0 mb-1 mr-2 transform translate-x-1/2 translate-y-1/2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {notificationCount}
                </span>
              )}
            </div>
          );
        })}

        {/* Add server button */}
        <button
          className="w-12 h-12 mt-2 rounded-full flex items-center justify-center bg-bg-primary dark:bg-dark-primary dark:text-dark-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover"
          onClick={() => setModalOpen(true)}
        >
          +
        </button>

        {/* Create Server Modal */}
        <CreateServerModal
          isModalOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          onServerCreated={fetchServers}
        />
      </div>
    </div>
  );
};

export default ServerList;
