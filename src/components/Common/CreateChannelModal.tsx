interface CreateChannelModalProps {
  newChannelCategoryId: string | null;
  newChannelName: string;
  setNewChannelName: (name: string) => void;
  newChannelDescription: string;
  setNewChannelDescription: (description: string) => void;
  handleCreateChannel: () => void;
  setNewChannelCategoryId: (id: string | null) => void;
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  newChannelCategoryId,
  newChannelName,
  newChannelDescription,
  setNewChannelDescription,
  setNewChannelName,
  handleCreateChannel,
  setNewChannelCategoryId,
}) => {
  return (
    <div>
      {newChannelCategoryId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="w-1/4 h-1/3b bg-bg-primary dark:bg-dark-primary rounded-lg p-6 z-50">
            <h2 className="text-lg font-semibold mb-4">Create New Channel</h2>
            <input
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="Channel Name"
              className="w-full p-2 rounded-lg mb-4 text-black outline-none"
            />
            <textarea
              value={newChannelDescription}
              onChange={(e) => setNewChannelDescription(e.target.value)}
              placeholder="Channel Description"
              className="w-full p-2 rounded-lg mb-4 text-black outline-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleCreateChannel}
                className="bg-button-primary  hover:bg-button-hover px-4 py-2 rounded"
              >
                Create
              </button>
              <button
                onClick={() => setNewChannelCategoryId(null)}
                className="ml-2 px-4 py-2 rounded"
              >
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
