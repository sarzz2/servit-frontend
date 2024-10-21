import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useSnackbar } from '../Snackbar';
import CreateChannelModal from '../Common/CreateChannelModal';
import CreateCategoryModal from './CreateCategoryModal';
import { Channel } from '../../types/channel';
import { Category } from '../../types/category';
import { Server } from '../../types/server';

interface CategoriesAndChannelsProps {
  server: Server;
}

const CategoriesAndChannels: React.FC<CategoriesAndChannelsProps> = ({
  server,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editedCategoryName, setEditedCategoryName] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [newChannelName, setNewChannelName] = useState<string>('');
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);
  const [editedChannelDescription, setEditedChannelDescription] =
    useState<string>('');
  const [editedChannelName, setEditedChannelName] = useState<string>('');
  const [newCategoryNameModal, setNewCategoryNameModal] =
    useState<boolean>(false);
  const [newChannelDescription, setNewChannelDescription] =
    useState<string>('');
  const [newChannelCategoryId, setNewChannelCategoryId] = useState<
    string | null
  >(null);
  const [channels, setChannels] = useState<{ [key: string]: Channel[] }>({});
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
      await axiosInstance.delete(`/category/${server.id}/${categoryId}`);
      showSnackbar('Category deleted successfully!', 'success');
      setCategories(categories.filter((cat) => cat.id !== categoryId));
    } catch (error) {
      showSnackbar('Error deleting category!', 'error');
    }
  };

  const handleCreateChannel = async () => {
    if (newChannelName && newChannelCategoryId) {
      try {
        const response = await axiosInstance.post(
          `/channels/${server.id}/${newChannelCategoryId}`,
          {
            name: newChannelName,
            description: newChannelDescription,
          }
        );
        showSnackbar('Channel created successfully!', 'success');
        setChannels((prevChannels) => ({
          ...prevChannels,
          [newChannelCategoryId]: [
            ...(prevChannels[newChannelCategoryId] || []),
            response.data.channel,
          ],
        }));
        setNewChannelName('');
        setNewChannelDescription('');
        setNewChannelCategoryId(null);
      } catch (error: any) {
        console.error('Error creating channel:', error);
        showSnackbar(error.response.data.detail[0].msg, 'error');
      }
    }
  };

  const editChannel = async (categoryId: string, channelId: string) => {
    try {
      // Update the channel name in the backend
      await axiosInstance.patch(`/channels/${server.id}/${channelId}`, {
        name: editedChannelName,
        description: editedChannelDescription,
      });

      // Update the channels state
      setChannels((prevChannels) => ({
        ...prevChannels,
        [categoryId]: prevChannels[categoryId].map((chan) =>
          chan.id === channelId
            ? {
                ...chan,
                name: editedChannelName,
                description: editedChannelDescription,
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
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-bg-primary dark:bg-dark-primary rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Categories and Channels</h2>
        <button
          onClick={() => setNewCategoryNameModal(true)}
          className="text-white bg-button-primary hover:bg-button-hover rounded-lg px-4 py-2"
        >
          Create New Category
        </button>
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
        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="mb-4">
              <div
                className="flex justify-between items-center p-4 bg-bg-secondary dark:bg-dark-secondary rounded-lg"
                onClick={() => toggleCategory(category.id)}
              >
                {editingCategoryId === category.id ? (
                  <div className="flex flex-grow items-center cursor-pointer">
                    <input
                      type="text"
                      value={editedCategoryName}
                      onChange={(e) => setEditedCategoryName(e.target.value)}
                      className="w-full bg-bg-secondary dark:bg-dark-secondary border-2 border-gray-300 dark:border-white-600 outline-none p-2 rounded-lg"
                      placeholder="Enter category name"
                      autoFocus
                    />
                    <button
                      onClick={(e) => saveCategory(e, category.id)}
                      className={`mx-2 ${editedCategoryName === category.name || editedCategoryName.trim() === '' ? 'text-gray-500' : 'text-green-500'}`}
                      disabled={
                        editedCategoryName === category.name ||
                        editedCategoryName.trim() === ''
                      }
                    >
                      <i className="fas fa-lg fa-check" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategoryId(null);
                      }}
                      className="text-red-500 mx-2"
                    >
                      <i className="fas fa-lg fa-times" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between cursor-pointer">
                      <span className="font-medium"> </span>

                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className={`w-5 h-5 transition-transform ${expandedCategories.includes(category.id) ? 'rotate-180' : 'rotate-90'}`}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 15l6-6 6 6"
                        />
                      </svg>
                      {category.name}
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setEditingCategoryId(category.id);
                          setEditedCategoryName(category.name);
                        }}
                        className="text-blue-500 mx-2"
                      >
                        <i className="fas fa-edit" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-500 mx-2"
                      >
                        <i className="fas fa-trash" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewChannelCategoryId(category.id); // Set category for new channel
                        }}
                        className="text-green-500 mx-2"
                      >
                        <i className="fas fa-plus" />
                      </button>
                      <button className="mx-2">
                        <i className="fas fa-gear" />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {expandedCategories.includes(category.id) && (
                <div className="ml-6 mt-2">
                  {channels[category.id]?.length === 0 ? (
                    <p>No channels found.</p>
                  ) : (
                    channels[category.id]?.map((channel: Channel) => (
                      <div
                        key={channel.id}
                        className="flex justify-between items-center p-2 mb-2 bg-bg-tertiary dark:bg-dark-tertiary rounded-md"
                      >
                        {editingChannelId === channel.id ? (
                          <>
                            <label className="block text-sm font-medium">
                              Channel Name
                              <input
                                value={editedChannelName}
                                onChange={(e) =>
                                  setEditedChannelName(e.target.value)
                                }
                                className="w-full bg-bg-secondary border-none p-2 rounded-lg mt-1 outline-none"
                                placeholder="Enter channel name"
                                autoFocus
                              />
                            </label>
                            <label className="block text-sm font-medium">
                              Channel Description
                              <input
                                value={editedChannelDescription}
                                onChange={(e) =>
                                  setEditedChannelDescription(e.target.value)
                                }
                                className="w-full bg-bg-secondary border-none p-2 rounded-lg mt-1 outline-none"
                                placeholder="Enter channel description"
                              />
                            </label>
                            <div>
                              <button
                                onClick={() =>
                                  editChannel(category.id, channel.id)
                                }
                                className={`mx-2 ${editedCategoryName === category.name || editedCategoryName.trim() === '' ? 'text-gray-500' : 'text-green-500'}`}
                                disabled={
                                  (editedChannelName === channel.name &&
                                    editedChannelDescription ===
                                      channel.description) ||
                                  editedChannelName.trim() === ''
                                }
                              >
                                <i className="fas fa-lg fa-check" />
                              </button>
                              <button
                                onClick={() => setEditingChannelId(null)}
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
                                  setEditingChannelId(channel.id);
                                  setEditedChannelName(channel.name);
                                  setEditedChannelDescription(
                                    channel.description
                                  );
                                }}
                                className="text-blue-500 mx-2"
                              >
                                <i className="fas fa-edit" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteChannel(category.id, channel.id)
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
              )}
            </div>
          ))
        )}
      </div>
      {/* Modal for creating new channel */}
      <CreateChannelModal
        newChannelCategoryId={newChannelCategoryId}
        newChannelName={newChannelName}
        setNewChannelName={setNewChannelName}
        newChannelDescription={newChannelDescription}
        setNewChannelDescription={setNewChannelDescription}
        handleCreateChannel={handleCreateChannel}
        setNewChannelCategoryId={setNewChannelCategoryId}
      />
    </div>
  );
};

export default CategoriesAndChannels;
