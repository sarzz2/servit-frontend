import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useSnackbar } from '../Snackbar';

interface CreateServerModalProps {
  isModalOpen: boolean;
  onClose: () => void;
  onServerCreated: () => void; // Callback to trigger refetch after server creation
}

const CreateServerModal: React.FC<CreateServerModalProps> = ({
  isModalOpen,
  onClose,
  onServerCreated,
}) => {
  const [serverName, setServerName] = useState('');
  const [serverPictureUrl, setServerPictureUrl] = useState<string | null>(null);
  const [serverPictureFile, setServerPictureFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (serverName) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [serverName]);

  const handleCreateServer = async () => {
    try {
      setIsButtonDisabled(true);
      let uploadedImageUrl = serverPictureUrl;

      // If there’s a selected image but it hasn’t been uploaded, upload it now
      if (serverPictureFile && !uploadedImageUrl) {
        const formData = new FormData();
        formData.append('file', serverPictureFile);

        const uploadResponse = await axiosInstance.post('/upload', formData);
        uploadedImageUrl = uploadResponse.data.url;
      }

      await axiosInstance.post('/servers/', {
        name: serverName,
        server_picture_url: uploadedImageUrl,
      });

      onServerCreated();
      setServerName('');
      setServerPictureUrl(null);
      setServerPictureFile(null);
      setImagePreview(null);
      onClose();
      showSnackbar('Server created successfully!', 'success');
    } catch (error: any) {
      showSnackbar(error.response?.data?.detail[0]?.msg, 'error');
    } finally {
      setIsButtonDisabled(false);
    }
  };

  const handleImagePreview = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setServerPictureFile(file); // Store the file temporarily without uploading

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Set preview URL
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isModalOpen) return null; // Don't render anything if the modal is closed

  return (
    <div className="fixed inset-0 flex items-center justify-center z-30">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative w-full max-w-md p-8 bg-bg-primary dark:bg-dark-primary rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-primary dark:text-dark-text-primary">
            Create Your Server
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-lg fa-times"></i>
          </button>
        </div>

        <p className="text-primary dark:text-dark-text-primary mb-6">
          Give your new server a personality with a name and an icon. You can
          always change it later.
        </p>

        <div className="mb-6 flex flex-col items-center justify-center">
          <label
            htmlFor="serverIcon"
            className="w-24 h-24 rounded-full border-2 border-dashed border-accent-color flex items-center justify-center cursor-pointer hover:bg-hover-bg dark:hover:bg-dark-hover"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Server Icon"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-accent-color">+</span>
            )}
          </label>
          <input
            id="serverIcon"
            type="file"
            className="hidden"
            onChange={handleImagePreview}
          />
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
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-bg-secondary dark:bg-dark-secondary text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent-color"
          />
        </div>

        <p className="text-xs text-secondary dark:text-dark-text-secondary mb-6">
          By creating a server, you agree to Servit's{' '}
          <button
            onClick={() => (window.location.href = '/community-guidelines')}
            className="text-accent-color underline bg-transparent border-none p-0 cursor-pointer"
          >
            Community Guidelines
          </button>
          .
        </p>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-secondary dark:text-dark-text-secondary hover:text-primary"
          >
            Back
          </button>
          <button
            onClick={handleCreateServer}
            className="px-6 py-2 rounded-lg bg-button-primary text-white hover:bg-button-hover disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isButtonDisabled}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateServerModal;
