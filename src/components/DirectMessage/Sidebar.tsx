import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';

const Sidebar = ({
  friends,
  setActiveChat,
  setToUserId,
  fetchFriends,
}: any) => {
  const [view, setView] = useState('all');
  const user = useSelector((state: RootState) => state.user.user);
  const userId = user?.id;

  return (
    <div className="w-64 bg-bg-tertiary dark:bg-bg-tertiary p-4">
      <div className="mb-4">
        <button
          className={`px-4 py-2 rounded-lg ${view === 'all' ? 'bg-bg-secondary dark:bg-dark-primary dark:text-dark-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover' : 'bg-primary  hover:bg-button-hover dark:hover:bg-dark-button-hover'}`}
          onClick={() => {
            setView('all');
            fetchFriends('all');
          }}
        >
          All
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${view === 'pending' ? 'bg-bg-secondary dark:bg-dark-primary dark:text-dark-text-primary hover:bg-button-hover dark:hover:bg-dark-button-hover' : 'bg-primary  hover:bg-button-hover dark:hover:bg-dark-button-hover'}`}
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
        {friends.map((user: any) => (
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
            />{' '}
            <div className="ml-2">{user.username}</div>
            {view === 'pending' && (
              <div className="ml-auto flex space-x-2">
                <button className="bg-green-500 rounded px-2">✓</button>
                <button className="bg-red-500 rounded px-2">✕</button>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
