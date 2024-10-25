import { useSelector } from 'react-redux';
import { Friend } from '../../types/friends';
import { selectOnlineUsers } from '../../slices/onlineStatusSlice';
import { goAxiosInstance } from '../../utils/axiosInstance';
import { useEffect, useState } from 'react';

interface SidebarProps {
  setActiveChat: (user: Friend) => void;
  setToUserId: (id: string) => void;
  setFriendsWindow: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  setActiveChat,
  setToUserId,
  setFriendsWindow,
}) => {
  const onlineUsers = useSelector(selectOnlineUsers);
  const [chatHistory, setChatHistory] = useState<Friend[]>([]);

  const fetchChatHistory = () => {
    // Fetch chat history with friend
    goAxiosInstance
      .get(`fetch_chat_history?token=${localStorage.getItem('access_token')}`)
      .then((response) => {
        if (response.data != null) {
          setChatHistory(response.data);
        }
      })
      .catch((error) => {
        console.error('Error fetching chat history', error);
      });
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  return (
    <div className="w-80 bg-bg-tertiary dark:bg-bg-tertiary p-4">
      <div className="flex flex-col space-y-2">
        <button
          className="flex items-center p-2 rounded-lg hover:bg-hover-bg dark:hover:bg-dark-hover"
          onClick={() => setFriendsWindow(true)}
        >
          Friends
        </button>
        {/* Search Input */}
        <input
          type="text"
          placeholder="Find or start a conversation"
          className="w-full p-2 rounded-lg bg-gray-200 dark:bg-dark-secondary mb-4"
        />

        {/* Friends List */}
        {chatHistory.map((friend) => (
          <button
            key={friend.username}
            className="flex items-center p-2 rounded-lg hover:bg-hover-bg dark:hover:bg-dark-hover"
            onClick={() => {
              setFriendsWindow(false);
              setActiveChat(friend);
              // setToUserId(
              //   friend.user_id === userId ? friend.friend_id : friend.user_id
              // );
              setToUserId(friend.friend_id);
            }}
          >
            {/* Profile Picture */}
            <div className="relative">
              <img
                src={friend.profile_picture_url}
                alt={friend.username}
                className="w-8 h-8 rounded-full"
              />
              {/* Online Status Dot */}
              {onlineUsers[friend.friend_id] ? (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border border-white rounded-full"></span>
              ) : (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-transparent border border-gray-400 rounded-full"></span>
              )}
            </div>

            {/* Friend's Username */}
            <div className="ml-4 text-white font-medium">{friend.username}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
