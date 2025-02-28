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

  const fetchFriends = (
    type: string,
    filters?: { search_query?: string; page?: number }
  ) => {
    let endpoint = '';
    if (type === 'pending') {
      endpoint = '/friends/requests';
    } else if (type === 'blocked') {
      endpoint = '/friends/blocked';
    } else {
      endpoint = '/friends';
    }

    // Construct query parameters if filters exist
    const params = new URLSearchParams();
    if (filters?.search_query)
      params.append('search_query', filters.search_query);
    if (filters?.page) params.append('page', filters.page.toString());

    axiosInstance
      .get(`${endpoint}?${params.toString()}`) // Append query params
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
        <Friends
          fetchFriends={fetchFriends}
          friends={friends}
          setActiveChat={setActiveChat}
          setFriendsWindow={setFriendsWindow}
          setToUserId={setToUserId}
        />
      ) : (
        <ChatWindow activeChat={activeChat || null} toUserId={toUserId} />
      )}
    </div>
  );
};

export default DirectMessageComponent;
