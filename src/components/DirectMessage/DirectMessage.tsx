import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { Friend } from '../../types/friends';

const DirectMessageComponent = () => {
  const [activeChat, setActiveChat] = useState<Friend | null>(null);
  const [toUserId, setToUserId] = useState<string>('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const user = useSelector((state: RootState) => state.user.user);
  const userId = user?.id;

  const fetchFriends = (type: string) => {
    const endpoint = type === 'pending' ? '/friends/requests' : '/friends';
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

  const handleSetActiveChat = (user: Friend) => {
    setActiveChat(user);
  };

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        friends={friends}
        setActiveChat={handleSetActiveChat}
        setToUserId={setToUserId}
        fetchFriends={fetchFriends}
      />
      <ChatWindow
        activeChat={activeChat || null}
        toUserId={toUserId}
        userId={userId}
      />
    </div>
  );
};

export default DirectMessageComponent;
