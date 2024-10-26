import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Channel } from '../types/channel';

interface ChannelChatProps {
  channel: Channel;
}

const ChannelChat: React.FC<ChannelChatProps> = ({ channel }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Fetch messages when the channel changes
    const fetchMessages = async () => {
      try {
        const response = await axiosInstance.get(
          `/channels/${channel.id}/messages`
        );
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages', error);
      }
    };

    fetchMessages();
  }, [channel]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await axiosInstance.post(`/channels/${channel.id}/messages`, {
        content: newMessage,
      });
      setNewMessage('');
      // Optionally refetch messages after sending
      const response = await axiosInstance.get(
        `/channels/${channel.id}/messages`
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  return (
    <div className="w-full h-screen p-4 bg-bg-primary dark:bg-dark-primary flex flex-col">
      <div className="flex flex-row items-center mb-2 justify-between">
        <div className="flex flex-row items-center">
          <h1 className="text-xl text-primary dark:text-dark-text-primary">
            #{channel.name}
          </h1>
          <span className="mx-2">|</span>
          <span className="text-sm text-secondary dark:text-dark-text-secondary">
            {channel.description}
          </span>
        </div>
        <div className="flex flex-row space-x-2">
          <button className="px-4 py-2 bg-primary text-white rounded">
            Button 1
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded">
            Button 2
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded">
            Button 3
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded">
            Button 4
          </button>
        </div>
      </div>
      <div className="h-full flex flex-col bg-bg-secondary dark:bg-dark-secondary p-4 rounded-lg">
        {/* Message list */}
        <div className="flex-grow overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className="mb-2">
              <strong>{message.user.username}</strong>: {message.content}
            </div>
          ))}
        </div>

        {/* Message input */}
        <div className="mt-2 flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full p-3 rounded-lg bg-bg-tertiary dark:bg-dark-tertiary outline-none"
            placeholder="Type a message"
          />
          <button
            onClick={sendMessage}
            className="ml-2 px-4 py-2 bg-bg-tertiary hover:bg-button-hover rounded-lg px-5 py-3 transition-all duration-200"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelChat;
