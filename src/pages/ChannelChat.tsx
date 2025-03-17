import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../Store';
import { format } from 'date-fns';
import { ChatProvider, useChat } from '../contexts/ChatProvider';
import { useNotifications } from '../contexts/NotificationProvider';

interface ChannelChatProps {
  channel: any;
  server: any;
}

interface ChannelChatUIProps {
  channel: any;
}

const ChannelChatUI: React.FC<ChannelChatUIProps> = ({ channel }) => {
  const {
    messages,
    sendMessage,
    typingUsers,
    sendTypingIndicator,
    fetchMoreMessages,
    hasMore,
  } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const user = useSelector((state: RootState) => state.user.user);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && newMessage.trim() !== '') {
      sendMessage(newMessage);
      setNewMessage('');
      sendTypingIndicator(false);
    } else if (event.key !== 'Tab' && newMessage.trim() !== '') {
      sendTypingIndicator(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false);
      }, 3000);
    }
  };

  const handleFetchMoreMessages = async () => {
    if (chatContainerRef.current && hasMore) {
      const container = chatContainerRef.current;
      // Record current scroll height before fetching older messages.
      const previousHeight = container.scrollHeight;
      fetchMoreMessages();
      // After messages are prepended, adjust scroll so that the user's view remains stable.
      setTimeout(() => {
        const newHeight = container.scrollHeight;
        container.scrollTop = newHeight - previousHeight;
      }, 100);
    }
  };

  // When channel changes, we want to scroll to the bottom (initial load).
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      // On initial load, scroll to the bottom.
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [channel.id, messages.length]);

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
            <i className="fas fa-search" />
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded">
            <i className="fas fa-thumbtack" />
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded">
            <i className="fas fa-user-group" />
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-hidden flex flex-col bg-bg-secondary dark:bg-dark-secondary p-4 rounded-lg">
        <div
          ref={chatContainerRef}
          onScroll={(e) => {
            // When scrolled to the top, fetch more messages.
            if ((e.target as HTMLDivElement).scrollTop === 0 && hasMore) {
              handleFetchMoreMessages();
            }
          }}
          className="flex-grow overflow-y-auto"
        >
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet...</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex mb-4 ${
                  msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender_id !== user?.id ? (
                  msg.profile_picture_url ? (
                    <img
                      src={msg.profile_picture_url}
                      alt="avatar"
                      className="w-8 h-8 rounded-full mr-2 mt-2"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full mr-2 mt-2 bg-bg-primary text-text-primary dark:bg-dark-primary dark:text-dark-text-primary flex items-center justify-center">
                      {msg.username[0].toUpperCase()}
                    </div>
                  )
                ) : null}
                <div
                  className={`p-3 rounded-lg max-w-xs ${
                    msg.sender_id === user?.id ? 'bg-blue-500' : 'bg-gray-500'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <span className="text-sm font-semibold mr-2">
                      {msg.sender_id === user?.id
                        ? user?.username
                        : msg.username}
                    </span>
                    <span className="text-xs text-gray-300">
                      {(() => {
                        try {
                          return format(
                            new Date(msg.timestamp),
                            'MMM d, HH:mm'
                          );
                        } catch {
                          return format(new Date(), 'MMM d, HH:mm');
                        }
                      })()}
                    </span>
                  </div>
                  <p>{msg.content}</p>
                </div>
                {msg.sender_id === user?.id &&
                  (user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="avatar"
                      className="w-8 h-8 rounded-full ml-2 mt-2"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full ml-2 mt-2 bg-gray-300 flex items-center justify-center">
                      {user?.username[0].toUpperCase()}
                    </div>
                  ))}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {typingUsers.length > 0 && (
        <div className="text-gray-500 mt-2 animate-pulse">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'}{' '}
          typing...
        </div>
      )}
      <div className="mt-2 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyUp={handleKeyPress}
          className="w-full p-3 rounded-lg bg-bg-tertiary dark:bg-dark-tertiary outline-none"
          placeholder="Type a message"
        />
        <button
          onClick={() => {
            sendMessage(newMessage);
            setNewMessage('');
          }}
          className="ml-2 px-4 py-2 bg-bg-tertiary hover:bg-button-hover rounded-lg transition-all duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
};

const ChannelChat: React.FC<ChannelChatProps> = ({ channel, server }) => {
  const socket = useSelector((state: RootState) => state.ws.connection);
  const user = useSelector((state: RootState) => state.user.user);
  const { clearChannelNotifications } = useNotifications();

  useEffect(() => {
    clearChannelNotifications(server.id, channel.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server.id, channel.id]);

  if (!socket || !user) return <div>Loading...</div>;

  return (
    <ChatProvider channel={channel} server={server} socket={socket} user={user}>
      <ChannelChatUI channel={channel} />
    </ChatProvider>
  );
};

export default ChannelChat;
