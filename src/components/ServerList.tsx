import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useSnackbar } from './Snackbar';
import { RootState } from '../Store';
import { useDispatch, useSelector } from 'react-redux';
import { selectServer } from '../slices/selectedServerSlice';
import ServerDetail from './ServerDetail';
import { setPermissions } from '../slices/permissionsSlice';
import DirectMessage from './DirectMessage/DirectMessage';

const ServerList: React.FC = () => {
  const [servers, setServers] = useState<any[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDirectMessageOpen, setDirectMessageOpen] = useState(false);
  const [serverName, setServerName] = useState('');
  const { showSnackbar } = useSnackbar();

  const selectedServer = useSelector(
    (state: RootState) => state.selectedServer
  );
  const dispatch = useDispatch();

  useEffect(() => {
    // Fetch servers from the API
    axiosInstance
      .get('/servers/user_servers')
      .then((response) => {
        setServers(response.data.servers);
      })
      .catch((error) => {
        console.log(error);
        showSnackbar('Error loading servers', 'error');
      });
  }, []);

  const handleCreateServer = () => {
    axiosInstance
      .post('/servers/', { name: serverName })
      .then((response) => {
        setServers((prev) => [...prev, response.data.server]);
        setModalOpen(false);
        setServerName('');
        showSnackbar('Server created successfully!', 'success');
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.detail[0]?.msg || 'Error creating server';
        showSnackbar(errorMessage, 'error');
      });
  };

  const handleSelectServer = (serverId: string, serverName: string) => {
    setDirectMessageOpen(false);
    dispatch(selectServer({ id: serverId, name: serverName }));

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
      <div className="w-16 h-screen flex flex-col items-center py-4 bg-secondary dark:bg-dark-secondary">
        <button
          className="w-12 h-12 mt-2 rounded-full flex items-center justify-center bg-bg-secondary dark:bg-dark-primary dark:text-dark-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover"
          onClick={() => {
            setDirectMessageOpen(true);
            dispatch(selectServer({ id: '', name: '' }));
          }} // Opens the DM component
        >
          DM
        </button>

        {/* Server icons */}
        {servers.map((server) => (
          <button
            key={server.id}
            className="w-12 h-12 mt-2 rounded-full flex items-center justify-center bg-bg-secondary text-text-primary dark:bg-dark-primary dark:text-dark-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover"
            onClick={() => handleSelectServer(server.id, server.name)} // Select server on click
          >
            {server.name[0].toUpperCase()}
          </button>
        ))}

        {/* Add server button */}
        <button
          className="w-12 h-12 mt-2 rounded-full flex items-center justify-center bg-bg-secondary dark:bg-dark-primary dark:text-dark-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover"
          onClick={() => {
            setModalOpen(true);
          }}
        >
          +
        </button>

        {/* Modal for creating a new server */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-30">
            {/* Dark semi-transparent background */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="relative w-full max-w-md p-8 bg-bg-primary dark:bg-dark-primary rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-primary dark:text-dark-text-primary">
                  Create Your Server
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  &#x2715; {/* Close icon */}
                </button>
              </div>

              <p className="text-primary dark:text-dark-text-primary mb-6">
                Give your new server a personality with a name and an icon. You
                can always change it later.
              </p>

              <div className="mb-6 flex flex-col items-center justify-center">
                <label
                  htmlFor="serverIcon"
                  className="w-24 h-24 rounded-full border-2 border-dashed border-accent-color flex items-center justify-center cursor-pointer hover:bg-hover-bg dark:hover:bg-dark-hover"
                >
                  <span className="text-accent-color">+</span>
                </label>
                <input id="serverIcon" type="file" className="hidden" />
                <p className="mt-2 text-sm text-secondary dark:text-dark-text-secondary">
                  Upload
                </p>
              </div>

              {/* Server Name Input */}
              <div className="mb-6">
                <label
                  htmlFor="serverName"
                  className="block text-sm font-medium text-primary dark:text-dark-text-primary mb-2"
                >
                  Server Name
                </label>
                <input
                  type="text"
                  id="serverName"
                  placeholder="Server Name"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-secondary dark:bg-dark-secondary text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
                />
              </div>

              <p className="text-xs text-secondary dark:text-dark-text-secondary mb-6">
                By creating a server, you agree to Servit's{' '}
                {/* <a href="#" className="text-accent-color underline">
                  Community Guidelines
                </a> */}
                .
              </p>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-secondary dark:text-dark-text-secondary hover:text-primary"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateServer}
                  className="px-6 py-2 rounded-lg bg-button-primary text-white hover:bg-button-hover"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DirectMessage renders if the DM button is clicked */}
      {isDirectMessageOpen && <DirectMessage />}

      {/* ServerDetail renders if a server is selected */}
      {selectedServer.id && (
        <ServerDetail
          serverId={selectedServer.id}
          serverName={selectedServer.name}
        />
      )}
    </div>
  );
};

export default ServerList;
