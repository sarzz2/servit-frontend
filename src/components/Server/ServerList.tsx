import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useSnackbar } from '../Snackbar';
import { useDispatch } from 'react-redux';
import { selectServer } from '../../slices/selectedServerSlice';
import { setPermissions } from '../../slices/permissionsSlice';
import { useNavigate } from 'react-router-dom';
import CreateServerModal from '../Common/CreateServerModal';

const ServerList: React.FC = () => {
  const [servers, setServers] = useState<any[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchServers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // Fetch permissions for the selected server
    axiosInstance
      .get(`/servers/${serverId}/roles_permissions`)
      .then((response) => {
        dispatch(setPermissions(response.data));
      })
      .catch((error) => {
        console.error(error);
        showSnackbar('Error loading permissions', 'error');
      });
  };

  return (
    <div className="flex">
      <div className="w-16 h-screen flex flex-col items-center py-4 bg-bg-secondary dark:bg-dark-secondary">
        <button
          className="w-12 h-12 mt-2 rounded-full flex items-center justify-center bg-bg-secondary dark:bg-dark-primary dark:text-dark-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover"
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
            className="w-12 h-12 mt-2 rounded-full flex items-center justify-center bg-bg-secondary text-text-primary dark:bg-dark-primary dark:text-dark-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover"
            onClick={() => handleSelectServer(server.id, server.name)}
          >
            {server.name[0].toUpperCase()}
          </button>
        ))}

        {/* Add server button */}
        <button
          className="w-12 h-12 mt-2 rounded-full flex items-center justify-center bg-bg-secondary dark:bg-dark-primary dark:text-dark-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover"
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
