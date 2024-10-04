import React, { useState } from 'react';
import ServerList from '../components/ServerList';
import ChatWindow from '../components/ChatWindow';

const UserHome: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  return (
    <div className="">
      <ServerList />
      {selectedChannel && <ChatWindow channelId={selectedChannel} />}
    </div>
  );
};

export default UserHome;
