import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useSnackbar } from '../Snackbar';
import CreateChannelModal from './CreateChannelModal';
import CreateCategoryModal from './CreateCategoryModal';
import { Channel } from '../../types/channel';
import { Category } from '../../types/category';
import { Server } from '../../types/server';
import ConfirmationDialog from '../Common/ConfirmationDialog';

interface RolesProps {
  server: Server;
}
interface RolesProps {
  roleName: string;
  roleDescription: string;
}

const Roles: React.FC<RolesProps> = ({ server }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editedCategoryName, setEditedCategoryName] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
  const [editedRoleDescription, setEditedRoleDescription] =
    useState<string>('');
  const [editedRoleName, setEditedRoleName] = useState<string>('');
  const [newCategoryNameModal, setNewCategoryNameModal] =
    useState<boolean>(false);
  const [newChannelCategoryId, setNewChannelCategoryId] = useState<
    string | null
  >(null);
  const [channels, setChannels] = useState<{ [key: string]: Channel[] }>({});
  const [isconfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [categoryId, setCategoryId] = useState<string>('');
  const [channelId, setChannelId] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [confirmMessage, setConfirmMessage] = useState<React.ReactNode>(null);
  const [isConfirmModalButtonDisable, setIsConfirmModalButtonDisable] =
    useState<boolean>(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server.id]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/category/${server.id}`);
      setCategories(response.data);

      // Fetch channels for each category
      const categoryChannels: { [key: string]: Channel[] } = {};
      for (const category of response.data) {
        const channelResponse = await axiosInstance.get(
          `/channels/${server.id}/${category.id}`
        );
        categoryChannels[category.id] = channelResponse.data;
      }
      setChannels(categoryChannels);
    } catch (error) {
      console.error('Error fetching categories or channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(
        expandedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  const saveCategory = async (event: React.MouseEvent, categoryId: string) => {
    event.stopPropagation();
    try {
      await axiosInstance.patch(`/category/${server.id}/${categoryId}`, {
        name: editedCategoryName,
      });
      setCategories(
        categories.map((cat) =>
          cat.id === categoryId ? { ...cat, name: editedCategoryName } : cat
        )
      );
    } catch (error: any) {
      showSnackbar(error.response.data.detail[0].msg, 'error');
      console.error('Error updating category:', error);
    } finally {
      setEditingCategoryId(null);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setIsConfirmModalButtonDisable(true);
      await axiosInstance.delete(`/category/${server.id}/${categoryId}`);
      showSnackbar('Category deleted successfully!', 'success');
      setCategories(categories.filter((cat) => cat.id !== categoryId));
    } catch (error) {
      showSnackbar('Error deleting category!', 'error');
    } finally {
      setIsConfirmModalButtonDisable(false);
    }
  };

  const handleCreateChannel = async (categoryData: RolesProps) => {
    // if (newChannelCategoryId) {
    //   try {
    //     const response = await axiosInstance.post(
    //       `/channels/${server.id}/${newChannelCategoryId}`,
    //       {
    //         name: categoryData.channelName,
    //         description: categoryData.channelDescription,
    //       }
    //     );
    //     showSnackbar('Channel created successfully!', 'success');
    //     setChannels((prevChannels) => ({
    //       ...prevChannels,
    //       [newChannelCategoryId]: [
    //         ...(prevChannels[newChannelCategoryId] || []),
    //         response.data.channel,
    //       ],
    //     }));
    //     setNewChannelCategoryId(null);
    //   } catch (error: any) {
    //     console.error('Error creating channel:', error);
    //     showSnackbar(error.response.data.detail[0].msg, 'error');
    //   }
    // }
  };

  const editRole = async (categoryId: string, channelId: string) => {
    try {
      // Update the channel name in the backend
      await axiosInstance.patch(`/channels/${server.id}/${channelId}`, {
        name: editedRoleName,
        description: editedRoleDescription,
      });

      // Update the channels state
      setChannels((prevChannels) => ({
        ...prevChannels,
        [categoryId]: prevChannels[categoryId].map((chan) =>
          chan.id === channelId
            ? {
                ...chan,
                name: editedRoleName,
                description: editedRoleDescription,
              }
            : chan
        ),
      }));
    } catch (error: any) {
      console.error('Error updating channel:', error);
      showSnackbar(error.response.data.detail[0].msg, 'error');
    } finally {
      setEditingChannelId(null);
    }
  };

  const handleDeleteChannel = async (categoryId: string, channelId: string) => {
    try {
      setIsConfirmModalButtonDisable(true);
      await axiosInstance.delete(`/channels/${server.id}/${channelId}`);

      // Update the channels state
      setChannels((prevChannels) => ({
        ...prevChannels,
        [categoryId]: prevChannels[categoryId]
          ? prevChannels[categoryId].filter((chan) => chan.id !== channelId)
          : [], // Fallback to empty array if category doesn't exist
      }));
    } catch (error) {
      console.error('Error deleting channel:', error);
    } finally {
      setIsConfirmModalButtonDisable(false);
    }
  };

  const toggleConfirmationDialog = (
    type: string,
    categoryId: string,
    categoryName: string,
    channelId: string = '',
    channelName: string = ''
  ) => {
    setType(type);
    setIsConfirmModalOpen(true);
    setCategoryId(categoryId);
    if (type === 'channel') {
      setChannelId(channelId);
    }
    setConfirmMessage(
      <>
        Are you sure, you want to{' '}
        <strong className="text-red-600">Delete</strong>
        {' the '}
        {type === 'channel' ? (
          <>
            channel <strong>{channelName}</strong>
          </>
        ) : (
          <>
            category <strong>{categoryName}</strong>
          </>
        )}
        ?
      </>
    );
  };

  const confirmConfirmationModal = async (type: string) => {
    if (type === 'channel') {
      await handleDeleteChannel(categoryId, channelId);
    } else {
      await handleDeleteCategory(categoryId);
    }
    setDefaultValues(type);
  };
  const setDefaultValues = (type: string) => {
    if (type === 'channel') {
      setChannelId('');
    }
    setIsConfirmModalOpen(false);
    setCategoryId('');
    setConfirmMessage('');
    setType('');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

    function setEditingRolelId(id: string) {
        throw new Error('Function not implemented.');
    }

  return (
    <div className="bg-bg-primary dark:bg-dark-primary rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Roles</h2>
        <button
          onClick={() => setNewCategoryNameModal(true)}
          className="text-white bg-button-primary hover:bg-button-hover rounded-lg px-4 py-2"
        >
          Create New Role
        </button>

        {/* WIP MODAL */}
        <CreateCategoryModal
          isOpen={newCategoryNameModal}
          onClose={() => setNewCategoryNameModal(false)}
          server={{
            id: server.id,
            name: server.name,
            server_picture_url: server.server_picture_url,
          }}
          onCategoryCreated={fetchCategories}
        />
      </div>

      <div className="mt-4">
        {/* WIP categroies inplace of roles */}
        {categories.length === 0 ? (
          <p>No roles found.</p>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="mb-4">
              <div
                className="flex justify-between items-center p-4 bg-bg-secondary dark:bg-dark-secondary rounded-lg"
                onClick={() => toggleCategory(category.id)}
              >
                {channels[category.id]?.length === 0 ? (
                  <p>No channels found.</p>
                ) : (
                  channels[category.id]?.map((channel: Channel) => (
                    <div
                      key={channel.id}
                      className="flex justify-between items-center flex-grow p-2 mb-2 bg-bg-tertiary dark:bg-dark-tertiary rounded-md"
                    >
                      {editingChannelId === channel.id ? (
                        <>
                          <label className="block text-sm font-medium">
                            Role Name
                            <input
                              value={editedRoleName}
                              onChange={(e) =>
                                setEditedRoleName(e.target.value)
                              }
                              className="w-full bg-bg-secondary border-none p-2 rounded-lg mt-1 outline-none"
                              placeholder="Enter channel name"
                              autoFocus
                            />
                          </label>
                          <label className="block text-sm font-medium">
                            Role Description
                            <input
                              value={editedRoleDescription}
                              onChange={(e) =>
                                setEditedRoleDescription(e.target.value)
                              }
                              className="w-full bg-bg-secondary border-none p-2 rounded-lg mt-1 outline-none"
                              placeholder="Enter channel description"
                            />
                          </label>
                          <div>
                            <button
                              onClick={() => editRole(category.id, channel.id)}
                              className={`mx-2 ${editedRoleName !== channel.name || editedRoleDescription !== channel.description ? 'text-green-500' : 'text-gray-500'}`}
                              disabled={
                                (editedRoleName === channel.name &&
                                  editedRoleDescription ===
                                    channel.description) ||
                                editedRoleName.trim() === ''
                              }
                            >
                              <i className="fas fa-lg fa-check" />
                            </button>
                            <button
                              onClick={() => setEditingRoleId(null)}
                              className="text-red-500 mx-2"
                            >
                              <i className="fas fa-lg fa-times" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center">
                            <div className="leading-tight">
                              <span>{channel.name}</span>
                              <br />
                              <span className="text-sm text-secondary dark:text-dark-text-secondary">
                                {channel.description}
                              </span>
                            </div>
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                setEditingRolelId(channel.id);
                                setEditedRoleName(channel.name);
                                setEditedRoleDescription(channel.description);
                              }}
                              className="text-blue-500 mx-2"
                            >
                              <i className="fas fa-edit" />
                            </button>
                            <button
                              onClick={() =>
                                toggleConfirmationDialog(
                                  'channel',
                                  category.id,
                                  category.name,
                                  channel.id,
                                  channel.name
                                )
                              }
                              className="text-red-500 mx-2"
                            >
                              <i className="fas fa-trash" />
                            </button>
                            <button className="mx-2">
                              <i className="fas fa-gear" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Modal for creating new channel */}
      {/* <CreateChannelModal
        newChannelCategoryId={newChannelCategoryId}
        handleCreateChannel={handleCreateChannel}
        setNewChannelCategoryId={setNewChannelCategoryId}
      /> */}
      {/* Modal for deleteing channels */}

      <ConfirmationDialog
        isOpen={isconfirmModalOpen}
        message={confirmMessage}
        onConfirm={async () => await confirmConfirmationModal(type)}
        onCancel={() => setDefaultValues(type)}
        disable={isConfirmModalButtonDisable}
      />
    </div>
  );
};

export default Roles;
