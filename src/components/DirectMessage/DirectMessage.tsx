import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';

const DirectMessageComponent = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [toUserId, setToUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const user = useSelector((state: RootState) => state.user.user);
  const userId = user?.id;

  const fetchFriends = (type: string) => {
    const endpoint = type === 'pending' ? '/friends/requests' : '/friends';
    axiosInstance
      .get(endpoint)
      .then((response) => setFriends(response.data))
      .catch((error) => console.log('Error fetching friends', error));
  };

  useEffect(() => {
    fetchFriends('all');
  }, []);

  return (
    <div className="flex h-screen w-full">
      <Sidebar
        friends={friends}
        setActiveChat={setActiveChat}
        setToUserId={setToUserId}
        fetchFriends={fetchFriends}
      />
      <ChatWindow activeChat={activeChat} toUserId={toUserId} userId={userId} />
    </div>
  );
};

export default DirectMessageComponent;
