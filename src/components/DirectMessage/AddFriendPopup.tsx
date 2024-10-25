import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Friend } from '../../types/friends';
import Skeleton from '../Skeleton';
import { useSnackbar } from '../Snackbar';

interface AddFriendPopupProps {
  onClose: () => void;
}

const AddFriendPopup: React.FC<AddFriendPopupProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const { showSnackbar } = useSnackbar();

  // Debouncing the search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetching search results when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      setIsLoading(true);
      axiosInstance
        .get(`/users/search/${debouncedQuery}`)
        .then((response) => {
          setSearchResults(response.data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching users:', error);
          setIsLoading(false);
        });
    } else {
      setSearchResults([]);
    }
  }, [debouncedQuery]);

  const cancelFriendRequest = (userId: string) => {
    axiosInstance
      .delete(`/friends/cancel/${userId}`)
      .then((response) => {
        showSnackbar('Friend request canceled!', 'success');
        setSearchResults((prevResults) =>
          prevResults.map((user) =>
            user.id === userId ? { ...user, status: 'none' } : user
          )
        );
      })
      .catch((error) => {
        showSnackbar('An error occurred. Please try again.', 'error');
        console.error('Error canceling friend request:', error);
      });
  };

  const sendFriendRequest = (userId: string) => {
    axiosInstance
      .post(`/friends/${userId}`)
      .then((response) => {
        showSnackbar('Friend request sent!', 'success');
        setSearchResults((prevResults) =>
          prevResults.map((user) =>
            user.id === userId ? { ...user, status: 'pending' } : user
          )
        );
      })
      .catch((error) => {
        if (error.response && error.response.status === 409) {
          alert('Friend request already sent');
        } else if (error.response && error.response.status === 400) {
          alert('Unable to send friend request');
        } else {
          console.error('Error sending friend request:', error);
          alert('An error occurred while sending the friend request');
        }
      });
  };

  const handleRemoveFriend = async (friend_id: string) => {
    try {
      await axiosInstance.patch(`/friends/${friend_id}/rejected`);
      showSnackbar('Friend removed Succesfully!', 'success');
    } catch (error) {
      showSnackbar('An error occurred. Please try again.', 'error');
      console.error('Error removing friend:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-bg-tertiary dark:bg-dark-tertiary p-8 rounded-lg shadow-lg w-1/2 h-3/4">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl text-text-primary dark:text-dark-text-primary">
            Add Friend
          </h2>
          <button
            className="text-text-primary dark:text-dark-text-primary"
            onClick={onClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <input
          type="text"
          placeholder="Search for users"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 mb-4 rounded-lg bg-gray-200 dark:bg-dark-secondary outline-none"
        />
        {isLoading ? (
          <>
            <Skeleton height="50px" />
            <Skeleton height="50px" />
            <Skeleton height="50px" />
          </>
        ) : (
          <div className="overflow-y-auto max-h-60">
            {searchResults.length > 0 ? (
              <ul>
                {searchResults.map((user) => (
                  <li
                    key={user.id}
                    className="flex items-center p-2 bg-bg-secondary dark:bg-dark-secondary mb-2 rounded-lg"
                  >
                    {user.profile_picture_url ? (
                      <img
                        src={user.profile_picture_url}
                        alt={user.profile_picture_url}
                        className="w-10 h-10 rounded-full mr-4"
                      />
                    ) : (
                      <button
                        key={user.id}
                        className="diasbled w-10 h-10 mr-2 rounded-full flex items-center justify-center bg-bg-primary text-text-primary dark:bg-dark-primary dark:text-dark-text-primary"
                      >
                        {user.username[0].toUpperCase()}
                      </button>
                    )}
                    <span className="text-text-primary dark:text-dark-text-primary">
                      {user.username}
                    </span>
                    {user.status === 'pending' ? (
                      <button
                        className="ml-auto text-yellow-500 rounded-lg flex items-center"
                        onClick={() => cancelFriendRequest(user.id)}
                      >
                        <i className="fas fa-hourglass-half mr-2"></i>
                        Cancel
                      </button>
                    ) : user.status === 'accepted' ? (
                      <button
                        className="ml-auto text-red-500 rounded-lg flex items-center"
                        onClick={() => handleRemoveFriend(user.id)}
                      >
                        <i className="fas fa-user-xmark mr-2"></i>
                      </button>
                    ) : (
                      <button
                        className="ml-auto text-green-500 rounded-lg flex items-center"
                        onClick={() => sendFriendRequest(user.id)}
                      >
                        <i className="fas fa-user-plus mr-2"></i>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-text-secondary dark:text-dark-text-secondary">
                No users found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddFriendPopup;
