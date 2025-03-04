import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useSnackbar } from '../Snackbar';
import { useDispatch } from 'react-redux';
import { selectServer } from '../../slices/selectedServerSlice';
import { useNavigate } from 'react-router-dom';
import CreateServerModal from '../Common/CreateServerModal';
import eventEmitter from '../../utils/eventEmitter';

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
  const dispatch = useDispatch();

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

  const fetchServers = () => {
    axiosInstance
      .get('/servers/user_servers')
      .then((response) => {
        setServers(response.data.servers);
      })
      .catch((error) => {
        console.log(error);
        showSnackbar('Error loading servers', 'error');
      });
  };

  const handleSelectServer = (serverId: string, serverName: string) => {
    dispatch(selectServer({ id: serverId, name: serverName }));
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
        {servers.map((server) => (
          <button
            key={server.id}
            className="w-12 h-12 mt-2 rounded-full flex items-center justify-center bg-bg-primary text-text-primary dark:bg-dark-primary dark:text-dark-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover"
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
        ))}

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
