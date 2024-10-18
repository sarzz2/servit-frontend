import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { Friend } from '../../types/friends';

interface SidebarProps {
  friends: Friend[];
  setActiveChat: (user: Friend) => void;
  setToUserId: (id: string) => void;
  setFriendsWindow: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  friends,
  setActiveChat,
  setToUserId,
  setFriendsWindow,
}) => {
  const user = useSelector((state: RootState) => state.user.user);
  const userId = user?.id;

  return (
    <div className="w-80 bg-bg-tertiary dark:bg-bg-tertiary p-4">
      <div className="flex flex-col space-y-2">
        <button
          className="flex items-center p-2 rounded-lg hover:bg-hover-bg dark:hover:bg-dark-hover"
          onClick={() => setFriendsWindow(true)}
        >
          Friends
        </button>
        <input
          type="text"
          placeholder="Find or start a conversation"
          className="w-full p-2 rounded-lg bg-gray-200 dark:bg-dark-secondary mb-4"
        />
        {friends.map((user) => (
          <button
            key={user.username}
            className="flex items-center p-2 rounded-lg hover:bg-hover-bg dark:hover:bg-dark-hover"
            onClick={() => {
              setFriendsWindow(false);
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
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
