import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from '../Snackbar';
import { selectServer } from '../../slices/selectedServerSlice';
import CreateCategoryModal from '../ServerSettings/CreateCategoryModal';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import ChannelChat from '../../pages/ChannelChat';
import { Server } from '../../types/server';
import { Channel } from '../../types/channel';
import { fetchPermissions } from '../../utils/fetchPermissions';
import { setPermissions } from '../../slices/permissionsSlice';
import UserBar from '../User/UserBar';
import eventEmitter from '../../utils/eventEmitter';

const ServerDetail: React.FC = () => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [channels, setChannels] = useState<{
    [key: string]: {
      description: any;
      id: string;
      name: string;
    }[];
  }>({});
  const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [newCategoryNameModal, setNewCategoryNameModal] =
    useState<boolean>(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [isOwnerLeaving, setIsOwnerLeaving] = useState<boolean>(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const { permissions } = useSelector((state: RootState) => state.permissions);

  const selectedServer = useSelector(
    (state: RootState) => state.selectedServer
  );
  const { serverId } = useParams<{ serverId: string }>();

  const { showSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const permissionSet = new Set(
    permissions.map((permission) => permission.name)
  );
  const canManageChannels = permissionSet.has('MANAGE_CHANNELS');
  const canManageServer = permissionSet.has('MANAGE_SERVER');
  const owner = permissionSet.has('OWNER');

  useEffect(() => {
    const fetchData = async () => {
      if (selectedServer.id !== serverId) {
        try {
          axiosInstance.get(`/servers/${serverId}`).then((response) => {
            dispatch(
              selectServer({
                id: response.data.server.id,
                name: response.data.server.name,
              })
            );
          });
        } catch (error) {
          console.error('Error fetching categories', error);
          navigate('/home');
        }
      }
    };
    const loadPermissions = async () => {
      if (permissionSet.size === 0) {
        try {
          const permissions = await fetchPermissions(serverId);
          dispatch(setPermissions(permissions));
        } catch (error) {
          console.error(error);
          showSnackbar('Error loading permissions', 'error');
        }
      }
    };

    loadPermissions();
    fetchData();
    fetchCategories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedServer.id]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(`/category/${serverId}`);
      const fetchedCategories = response.data;
      setCategories(fetchedCategories);

      // Initialize an array to accumulate channels for all categories
      const allChannels: {
        [key: string]: { description: string; id: string; name: string }[];
      } = {};

      // Loop through the categories to fetch their channels
      for (let i = 0; i < fetchedCategories.length; i++) {
        const channelsResponse = await axiosInstance.get(
          `/channels/${serverId}/${fetchedCategories[i].id}`
        );

        // Store channels for the current category in the allChannels object
        allChannels[fetchedCategories[i].id] = channelsResponse.data.map(
          (channel: { description: string; id: string; name: string }) => ({
            ...channel,
            description: channel.description || '', // Add a default description if not present
          })
        );
      }

      // Set the accumulated channels in the state
      setChannels(allChannels);
    } catch (error) {
      console.error('Error fetching categories', error);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newExpandedCategories = new Set(prev);
      newExpandedCategories.has(categoryId)
        ? newExpandedCategories.delete(categoryId)
        : newExpandedCategories.add(categoryId);
      return newExpandedCategories;
    });
  };

  const confirmLeaveServer = async () => {
    try {
      await axiosInstance.post(`/servers/leave/${selectedServer.id}`);
      eventEmitter.emit('leaveServer', { serverId: selectedServer.id });
      showSnackbar('Left server successfully', 'success');
      navigate('/home');
    } catch (error) {
      showSnackbar('Error leaving server', 'error');
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-grow">
      <div className="w-64 relative bg-bg-tertiary h-screen py-2">
        <div
          className="mb-2 px-4 py-2 bg-bg-secondary dark:bg-dark-secondary text-primary dark:text-dark-text-primary shadow-lg flex items-center justify-between cursor-pointer"
          onClick={() => setDropdownOpen(!isDropdownOpen)}
        >
          <span className="font-semibold">{selectedServer.name}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>

        {isDropdownOpen && (
          <div className="absolute z-30 left-1/6 transform -translate-x-1/6 w-60 bg-bg-secondary rounded-lg shadow-lg ml-2">
            {owner && (
              <div
                className="px-4 py-2 hover:bg-hover-bg cursor-pointer"
                onClick={() => navigate(`/settings/${selectedServer.id}`)}
              >
                Server Settings
              </div>
            )}
            {(canManageChannels || canManageServer || owner) && (
              <div
                className="px-4 py-2 hover:bg-hover-bg cursor-pointer"
                onClick={() => setNewCategoryNameModal(true)}
              >
                Create Category
              </div>
            )}
            <div
              className="px-4 py-2 text-red-500 hover:bg-hover-bg cursor-pointer"
              onClick={() => {
                setIsOwnerLeaving(owner);
                setConfirmDialogOpen(true);
              }}
            >
              Leave Server
            </div>
          </div>
        )}

        {selectedServer.id && (
          <CreateCategoryModal
            isOpen={newCategoryNameModal}
            onClose={() => setNewCategoryNameModal(false)}
            server={selectedServer as Server}
            onCategoryCreated={fetchCategories}
          />
        )}

        <ConfirmationDialog
          isOpen={isConfirmDialogOpen}
          message={
            isOwnerLeaving
              ? 'You are the owner of this server. This action cannot be reversed, and all associated data will be deleted.'
              : 'Are you sure you want to leave this server?'
          }
          onConfirm={confirmLeaveServer}
          onCancel={() => setConfirmDialogOpen(false)}
        />

        {categories.map((category) => (
          <div key={category.id} className="mb-4">
            <div
              className="flex items-center justify-between px-4 cursor-pointer"
              onClick={() => toggleCategory(category.id)}
            >
              <span className="font-semibold">{category.name}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`w-5 h-5 transition-transform ${expandedCategories.has(category.id) ? 'rotate-180' : 'rotate-90'}`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 15l6-6 6 6"
                />
              </svg>
            </div>
            {expandedCategories.has(category.id) &&
              channels[category.id]?.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => {
                    const fullChannel = {
                      ...channel,
                      description: channel.description,
                      members: [], // Add default or fetched members
                      createdAt: new Date().toISOString(), // Add default or fetched createdAt
                    };
                    setSelectedChannel(fullChannel);
                  }}
                  className="ml-6 mt-2 text-secondary dark:text-dark-text-secondary cursor-pointer"
                >
                  {channel.name}
                </div>
              ))}
          </div>
        ))}
        <UserBar />
      </div>
      {selectedChannel && (
        <div className="flex-grow">
          <ChannelChat channel={selectedChannel} />
        </div>
      )}
    </div>
  );
};

export default ServerDetail;
