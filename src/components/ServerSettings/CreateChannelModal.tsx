import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Server } from '../../types/server';
import { CreateChannelProps } from '../../types/createChannelProps';

interface CreateChannelModalProps {
  newChannelCategoryId: string | null;
  handleCreateChannel: (categoryData: CreateChannelProps) => void;
  setNewChannelCategoryId: (id: string | null) => void;
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  newChannelCategoryId,
  handleCreateChannel,
  setNewChannelCategoryId,
}) => {
  const [channelName, setChannelName] = useState<string>('');
  const [channelDescription, setChannelDescription] = useState<string>('');
  const [isCreateButtonDisable, setIsCreateButtonDisable] =
    useState<boolean>(true);

  useEffect(() => {
    if (channelName && channelDescription) {
      return setIsCreateButtonDisable(false);
    }
    return setIsCreateButtonDisable(true);
  }, [channelName, channelDescription]);

  const handleCreate = () => {
    modalClose();
    handleCreateChannel({ channelName, channelDescription });
  };

  const modalClose = () => {
    setChannelName('');
    setChannelDescription('');
    setNewChannelCategoryId(null);
  };

  return (
    <div>
      {newChannelCategoryId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="w-1/4 h-1/3b bg-bg-primary dark:bg-dark-primary rounded-lg p-6 z-50">
            <h2 className="text-lg font-semibold mb-4">Create New Channel</h2>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="Channel Name"
              className="w-full p-2 rounded-lg mb-4 text-black outline-none"
            />
            <textarea
              value={channelDescription}
              onChange={(e) => setChannelDescription(e.target.value)}
              placeholder="Channel Description"
              className="w-full p-2 rounded-lg mb-4 text-black outline-none"
            />
            <div className="flex justify-end">
              <button
                onClick={() => handleCreate()}
                className="bg-button-primary  hover:bg-button-hover px-4 py-2 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
                disabled={isCreateButtonDisable}
              >
                Create
              </button>
              <button onClick={modalClose} className="ml-2 px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateChannelModal;
function showSnackbar(arg0: string, arg1: string) {
  throw new Error('Function not implemented.');
}
