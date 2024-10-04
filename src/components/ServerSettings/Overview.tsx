import React, { useEffect, useState } from 'react';
import SaveCancelButtons from '../SaveCancelButtons';
import axiosInstance from '../../utils/axiosInstance';
import Snackbar from '../Snackbar';

interface OverviewProps {
  server: any;
  setServer: (server: any) => void;
}

const Overview: React.FC<OverviewProps> = ({ server, setServer }) => {
  const [initialServer, setInitialServer] = useState<any>(server);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [tempServer, setTempServer] = useState<any>(server);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

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
        setSnackbar({
          message: 'Server updated successfully!',
          type: 'success',
        });
        setServer(tempServer);
        setInitialServer(tempServer);
        setHasChanges(false);
      })
      .catch((error) => {
        setSnackbar({
          message: 'Server could not be updated! Please try again',
          type: 'error',
        });
        console.error('Error updating server:', error);
      });
  };

  const handleCancel = () => {
    setTempServer(initialServer);
    setHasChanges(false);
  };

  return (
    <div className="bg-primary dark:bg-dark-primary rounded-lg p-6">
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar(null)}
        />
      )}
      <div className="flex items-center mb-6">
        <div className="relative">
          <img
            src={
              server.image ||
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
            className="w-full bg-secondary dark:bg-dark-secondary border-none border-gray-300 dark:border-dark-border p-2 rounded-lg"
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
            className="w-full bg-secondary dark:bg-dark-secondary border-none border-gray-300 dark:border-dark-border p-2 rounded-lg"
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

      <SaveCancelButtons
        hasChanges={hasChanges}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Overview;
