import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { Friend } from '../../types/friends';
import Friends from './Friends';

const DirectMessageComponent = () => {
  const [activeChat, setActiveChat] = useState<Friend | null>(null);
  const [toUserId, setToUserId] = useState<string>('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendsWindow, setFriendsWindow] = useState<boolean>(true);

  const fetchFriends = (type: string) => {
    let endpoint = '';
    if (type === 'pending') {
      endpoint = '/friends/requests';
    } else if (type === 'blocked') {
      endpoint = '/friends/blocked';
    } else {
      endpoint = '/friends';
    }
    axiosInstance
      .get(endpoint)
      .then((response) => {
        const friendsData = response.data.map((friend: Friend) => ({
          id: friend.id,
          name: friend.name,
          user_id: friend.user_id,
          friend_id: friend.friend_id,
          username: friend.username,
          profile_picture_url: friend.profile_picture_url,
        }));
        setFriends(friendsData);
      })
      .catch((error) => console.error('Error fetching friends', error));
  };

  useEffect(() => {
    fetchFriends('all');
  }, []);

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        setFriendsWindow={setFriendsWindow}
        setActiveChat={setActiveChat}
        setToUserId={setToUserId}
      />
      {friendsWindow ? (
        <Friends fetchFriends={fetchFriends} friends={friends} />
      ) : (
        <ChatWindow activeChat={activeChat || null} toUserId={toUserId} />
      )}
    </div>
  );
};

export default DirectMessageComponent;
