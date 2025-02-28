import { useState, useEffect, useRef } from 'react';
import { Friend } from '../../types/friends';
import axiosInstance from '../../utils/axiosInstance';
import { useSnackbar } from '../Snackbar';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import AddFriendPopup from './AddFriendPopup';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';

interface FriendsProps {
  fetchFriends: (view: string, filters?: any) => void;
  friends: Friend[];
  setActiveChat: (friend: any) => void;
  setFriendsWindow: (value: boolean) => void;
  setToUserId: (value: string) => void;
}

const Friends: React.FC<FriendsProps> = ({
  friends,
  fetchFriends,
  setActiveChat,
  setFriendsWindow,
  setToUserId,
}) => {
  const [view, setView] = useState<'all' | 'pending' | 'blocked'>('all');
  const [openOptions, setOpenOptions] = useState<string | null>(null);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [showAddFriendPopup, setShowAddFriendPopup] = useState(false);
  const [isConfirmModalButtonDisable, setIsConfirmModalButtonDisable] =
    useState<boolean>(false);
  const { showSnackbar } = useSnackbar();
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const user = useSelector((state: RootState) => state.user.user);
  const [filters, setFilters] = useState({
    search_query: '',
    page: 1,
  });
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFriends(view, filters);
    }, 500);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setOpenOptions(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleView = (newView: 'all' | 'pending' | 'blocked') => {
    if (view !== newView) {
      setView(newView);
      fetchFriends(newView);
    }
  };

  const handleToggleOptions = (friendId: string) => {
    setOpenOptions((prevId) => (prevId === friendId ? null : friendId));
  };

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

  const handleRemoveFriend = async () => {
    try {
      setIsConfirmModalButtonDisable(true);
      await axiosInstance.patch(`/friends/${openOptions}/rejected`);
      setOpenOptions(null);
      fetchFriends(view);
      showSnackbar('Friend removed Succesfully!', 'success');
    } catch (error) {
      showSnackbar('An error occurred. Please try again.', 'error');
      console.error('Error removing friend:', error);
    } finally {
      setIsConfirmModalButtonDisable(false);
    }
  };

  return (
    <div className="w-full items-center justify-between p-4 bg-bg-primary dark:bg-dark-primary">
      {/* View Toggle Buttons */}
      <div className="flex space-x-4">
        {['all', 'pending', 'blocked'].map((v) => (
          <button
            key={v}
            className={`px-4 py-2 rounded-lg ${
              view === v
                ? 'bg-bg-button-primary dark:bg-dark-button-primary dark:text-dark-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover'
                : 'bg-bg-primary text-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover'
            }`}
            onClick={() => handleToggleView(v as 'all' | 'pending' | 'blocked')}
          >
            {v === 'all'
              ? 'Friends'
              : v === 'pending'
                ? 'Friend Requests'
                : 'Blocked'}
          </button>
        ))}
        <button
          className="bg-green-600 text-text-primary dark:text-dark-text-primary p-2 rounded-lg hover:bg-button-hover dark:hover:bg-dark-button-hover"
          onClick={() => setShowAddFriendPopup(true)} // Show popup on click
        >
          Add Friend
        </button>

        {/* Conditionally render AddFriendPopup */}
        {showAddFriendPopup && (
          <AddFriendPopup onClose={() => setShowAddFriendPopup(false)} />
        )}
      </div>
      <input
        type="text"
        placeholder="Search"
        className="w-full p-2 mt-4 rounded-lg bg-gray-200 dark:bg-dark-secondary outline-none"
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            search_query: e.target.value,
            page: 1, // Reset to first page on new search
          }))
        }
      />

      <div className="mt-4">
        {view === 'all' && (
          <ul>
            {friends.map((friend) => (
              <li
                key={friend.user_id}
                className="relative flex items-center p-2 mb-2 bg-bg-secondary dark:bg-dark-secondary rounded-lg"
              >
                {friend.profile_picture_url ? (
                  <img
                    src={friend.profile_picture_url}
                    alt="profile"
                    className="w-10 h-10 rounded-full mr-4"
                  />
                ) : (
                  <button
                    key={friend.id}
                    className="diasbled w-10 h-10 mr-2 rounded-full flex items-center justify-center bg-bg-primary text-text-primary dark:bg-dark-primary dark:text-dark-text-primary"
                  >
                    {friend.username[0].toUpperCase()}
                  </button>
                )}
                <span className="text-text-primary dark:text-dark-text-primary">
                  {friend.username}
                </span>

                {/* Ellipsis Button */}
                <button
                  className="absolute top-2 right-2 p-2 outline-none"
                  onClick={() => handleToggleOptions(friend.user_id)}
                >
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>

                <button
                  className="absolute top-2 right-8 p-2 outline-none"
                  onClick={() => {
                    setFriendsWindow(false);
                    setActiveChat(friend);
                    setToUserId(
                      friend.user_id !== user?.id
                        ? friend.user_id
                        : friend.friend_id
                    );
                  }}
                >
                  <i className="fa-solid fa-comment"></i>
                </button>

                {/* Dropdown Options */}
                {openOptions === friend.user_id && (
                  <div
                    ref={optionsRef}
                    className="absolute right-2 mt-24 w-48 bg-bg-tertiary dark:bg-dark-tertiary rounded-md shadow-lg z-10"
                  >
                    <button className="block w-full text-left px-4 py-2 text-sm text-text-primary dark:text-dark-text-primary hover:bg-hover-bg dark:hover:bg-dark-hover">
                      View Profile
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-hover-bg dark:hover:bg-dark-hover"
                      onClick={() => setConfirmDialogOpen(true)}
                    >
                      Remove Friend
                    </button>
                    <ConfirmationDialog
                      isOpen={isConfirmDialogOpen}
                      message={`Are you sure you want to remove ${friend.username} from your friend list?`}
                      onConfirm={handleRemoveFriend}
                      onCancel={() => setConfirmDialogOpen(false)}
                      disable={isConfirmModalButtonDisable}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {view === 'pending' && (
          <ul>
            {friends.map((friend) => (
              <li
                key={friend.user_id}
                className="relative flex items-center p-2 mb-2 bg-bg-secondary dark:bg-dark-secondary rounded-lg"
              >
                {friend.profile_picture_url ? (
                  <img
                    src={friend.profile_picture_url}
                    alt="profile"
                    className="w-10 h-10 rounded-full mr-4"
                  />
                ) : (
                  <button
                    key={friend.id}
                    className="diasbled w-10 h-10 mr-2 rounded-full flex items-center justify-center bg-bg-primary text-text-primary dark:bg-dark-primary dark:text-dark-text-primary"
                  >
                    {friend.username[0].toUpperCase()}
                  </button>
                )}
                <span className="text-text-primary dark:text-dark-text-primary">
                  {friend.username}
                </span>

                {/* Accept Button */}
                <button
                  className="ml-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  onClick={() =>
                    handleFriendRequest(friend.user_id, 'accepted')
                  }
                >
                  <i className="fa-solid fa-check"></i>
                </button>

                {/* Decline Button */}
                <button
                  className="ml-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  onClick={() =>
                    handleFriendRequest(friend.user_id, 'rejected')
                  }
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </li>
            ))}
          </ul>
        )}
        {view === 'blocked' && (
          <ul>
            {friends.map((friend) => (
              <li
                key={friend.user_id}
                className="relative flex items-center p-2 mb-2 bg-bg-secondary dark:bg-dark-secondary rounded-lg"
              >
                {friend.profile_picture_url ? (
                  <img
                    src={friend.profile_picture_url}
                    alt="profile"
                    className="w-10 h-10 rounded-full mr-4"
                  />
                ) : (
                  <button
                    key={friend.id}
                    className="diasbled w-10 h-10 mr-2 rounded-full flex items-center justify-center bg-bg-primary text-text-primary dark:bg-dark-primary dark:text-dark-text-primary"
                  >
                    {friend.username[0].toUpperCase()}
                  </button>
                )}
                <span className="text-text-primary dark:text-dark-text-primary">
                  {friend.username}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Friends;
