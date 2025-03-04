import React, { useEffect, useState } from 'react';
import SaveCancelButtons from '../SaveCancelButtons';
import axiosInstance from '../../utils/axiosInstance';
import { useSnackbar } from '../Snackbar';
import { Server } from '../../types/server';

interface OverviewProps {
  server: Server;
  setServer: (server: Server) => void;
}

const Overview: React.FC<OverviewProps> = ({ server, setServer }) => {
  const [initialServer, setInitialServer] = useState<any>(server);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [tempServer, setTempServer] = useState<any>(server);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    setInitialServer(server);
    setTempServer(server);
    setHasChanges(false);
  }, [server]);

  useEffect(() => {
    const isEqual =
      JSON.stringify(initialServer) === JSON.stringify(tempServer);
    setHasChanges(!isEqual);
  }, [tempServer, initialServer]);

  const handleSave = () => {
    axiosInstance
      .patch(`/servers/${server.id}`, {
        name: tempServer.name,
        description: tempServer.description,
        is_public: tempServer.is_public,
      })
      .then(() => {
        showSnackbar('Server updated successfully!', 'success');

        setServer(tempServer);
        setInitialServer(tempServer);
        setHasChanges(false);
      })
      .catch((error) => {
        showSnackbar(error.response.data.detail[0].msg, 'error');

        console.error('Error updating server:', error);
      });
  };

  const handleCancel = () => {
    setTempServer(initialServer);
    setHasChanges(false);
  };

  const handleRegenerateInviteCode = async () => {
    try {
      const response = await axiosInstance.patch(
        `/servers/regenerate_invite_code/${tempServer.id}`
      );

      if (response.status === 200) {
        setInitialServer({
          ...initialServer,
          invite_code: response.data.invite_code,
        });
        setTempServer({
          ...tempServer,
          invite_code: response.data.invite_code,
        });
      }
    } catch (error: any) {
      if (error.response && error.response.status === 429) {
        showSnackbar('Too Many Requests! Please try again later.', 'error');
      } else {
        console.error('Error regenerating invite code:', error);
      }
    }
  };

  return (
    <div className="bg-bg-primary dark:bg-dark-primary rounded-lg p-6">
      <div className="flex items-center mb-6">
        <div className="relative">
          <img
            src={
              server.server_picture_url ||
              'https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM='
            }
            alt="Server"
            className="w-24 h-24 rounded-full"
          />
          <label
            htmlFor="upload-image"
            className="absolute bottom-0 right-0 bg-gray-600 dark:bg-dark-hover text-white p-1 rounded-full cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm2 10l4-4 4 4m0-4l-4-4-4 4" />
            </svg>
          </label>
          <input
            type="file"
            id="upload-image"
            className="hidden"
            onChange={(e) => {
              console.log('Image upload not implemented');
            }}
          />
        </div>

        <div className="ml-6 w-full">
          <label className="block font-medium mb-2">Server Name</label>
          <input
            type="text"
            value={tempServer.name || ''}
            onChange={(e) =>
              setTempServer({ ...tempServer, name: e.target.value })
            }
            className="w-full bg-bg-secondary dark:bg-dark-secondary outline-none border-gray-300 dark:border-dark-border p-2 rounded-lg"
            placeholder="Enter server name"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="w-full">
          <label className="block font-medium mb-2">Server Description</label>
          <input
            type="text"
            value={tempServer.description || ''}
            onChange={(e) =>
              setTempServer({ ...tempServer, description: e.target.value })
            }
            className="w-full bg-bg-secondary dark:bg-dark-secondary outline-none border-gray-300 dark:border-dark-border p-2 rounded-lg"
            placeholder="Enter server description"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span>Public Server</span>
        <label className="relative inline-block w-10 h-6">
          <input
            type="checkbox"
            checked={tempServer.is_public || false}
            onChange={(e) =>
              setTempServer({
                ...tempServer,
                is_public: e.target.checked,
              })
            }
            className="sr-only peer"
          />
          <div className="w-10 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-green-300 transition-colors duration-300"></div>
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-4"></div>
        </label>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="w-full flex items-center justify-between">
          <label className="font-medium mb-2">Invite Code</label>
          <div className="flex justify-end items-center gap-3">
            <input
              type="text"
              value={tempServer.invite_code || ''}
              className="flex-grow-1 bg-bg-secondary dark:bg-dark-secondary outline-none border-gray-300 dark:border-dark-border p-2 rounded-lg"
            />
            <i
              className="fas fa-lg fa-solid fa-rotate cursor-pointer"
              onClick={handleRegenerateInviteCode}
              title="Regenerate Invite Code"
            ></i>
          </div>
        </div>
      </div>

      <SaveCancelButtons
        hasChanges={hasChanges}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Overview;
