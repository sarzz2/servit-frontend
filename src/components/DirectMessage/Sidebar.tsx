import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { useSnackbar } from '../Snackbar';
import axiosInstance from '../../utils/axiosInstance';
import { Friend } from '../../types/friends';

interface SidebarProps {
  friends: Friend[];
  setActiveChat: (user: Friend) => void;
  setToUserId: (id: string) => void;
  fetchFriends: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  friends,
  setActiveChat,
  setToUserId,
  fetchFriends,
}) => {
  const [view, setView] = useState('all');
  const user = useSelector((state: RootState) => state.user.user);
  const userId = user?.id;
  const { showSnackbar } = useSnackbar();

  const handleFriendRequest = async (user_id: string, status: string) => {
    try {
      await axiosInstance.patch(`/friends/${user_id}/${status}`);
      fetchFriends(view);
      if (status === 'accepted') {
        showSnackbar('Friend request accepted!', 'success');
      } else {
        showSnackbar('Friend request rejected!', 'error');
      }
    } catch (error) {
      showSnackbar('An error occurred. Please try again.', 'error');
      console.error('Error updating friend status:', error);
    }
  };

  return (
    <div className="w-80 bg-bg-tertiary dark:bg-bg-tertiary p-4">
      <div className="mb-4">
        <button
          className={`px-4 py-2 rounded-lg ${
            view === 'all'
              ? 'bg-bg-button-primary dark:bg-dark-button-primary dark:text-dark-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover'
              : 'bg-bg-primary  hover:bg-button-hover dark:hover:bg-dark-button-hover'
          }`}
          onClick={() => {
            setView('all');
            fetchFriends('all');
          }}
        >
          All
        </button>
        <button
          className={`px-4 py-2 ml-2 rounded-lg ${
            view === 'pending'
              ? 'bg-bg-button-primary dark:bg-dark-button-primary dark:text-dark-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover'
              : 'bg-bg-primary  hover:bg-button-hover dark:hover:bg-dark-button-hover'
          }`}
          onClick={() => {
            setView('pending');
            fetchFriends('pending');
          }}
        >
          Pending
        </button>
      </div>

      <input
        type="text"
        placeholder="Find or start a conversation"
        className="w-full p-2 rounded-lg bg-gray-200 dark:bg-dark-secondary mb-4"
      />

      <div className="flex flex-col space-y-2">
        {friends.map((user) => (
          <button
            key={user.username}
            className="flex items-center p-2 rounded-lg hover:bg-hover-bg dark:hover:bg-dark-hover"
            onClick={() => {
              setActiveChat(user);
              setToUserId(
                user.user_id === userId ? user.friend_id : user.user_id
              );
            }}
          >
            <img
              src={user.profile_picture_url}
              alt={user.username}
              className="w-8 h-8 rounded-full"
            />
            <div className="ml-2">{user.username}</div>
            {view === 'pending' && (
              <div className="ml-auto flex space-x-2">
                <button
                  className="bg-green-500 rounded px-2"
                  onClick={() => handleFriendRequest(user.user_id, 'accepted')}
                >
                  ✓
                </button>
                <button
                  className="bg-red-500 rounded px-2"
                  onClick={() => handleFriendRequest(user.user_id, 'rejected')}
                >
                  ✕
                </button>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
