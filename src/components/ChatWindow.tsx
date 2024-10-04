import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

const ChatWindow: React.FC<{ channelId: string }> = ({ channelId }) => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    axiosInstance.get(`/channels/${channelId}/messages`).then((response) => {
      setMessages(response.data);
    });
  }, [channelId]);

  return (
    <div className="flex-grow bg-gray-900 text-white h-screen p-6">
      <div className="h-full overflow-y-scroll space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.user.username}:</strong> {message.content}
          </div>
        ))}
      </div>
      {/* Message input */}
      <div className="flex items-center mt-4">
        <input
          type="text"
          className="flex-grow bg-gray-800 p-2 rounded text-white"
          placeholder="Type a message..."
        />
        <button className="ml-2 bg-blue-600 px-4 py-2 rounded">Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;
