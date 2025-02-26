import React, { useState, useEffect, useRef } from 'react';
import { goAxiosInstance } from '../utils/axiosInstance';
import { Channel } from '../types/channel';
import { useSelector } from 'react-redux';
import { RootState } from '../Store';
import { useSnackbar } from '../components/Snackbar';
import { format } from 'date-fns';

interface ChannelChatProps {
  channel: Channel;
}

const ChannelChat: React.FC<ChannelChatProps> = ({ channel }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [pagingState, setPagingState] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { showSnackbar } = useSnackbar();
  const user = useSelector((state: RootState) => state.user.user);
  const socket = useSelector((state: RootState) => state.ws.connection);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const userId = user?.id;

  useEffect(() => {
    setHasMore(true);
    setPagingState('');
    setMessages([]);
    fetchMessages();
    if (socket && socket.readyState === WebSocket.OPEN && userId) {
      const switchMsg = {
        type: 'switch_chat',
        data: {
          chat_type: 'channel',
          chat_id: channel.id,
        },
      };
      socket.send(JSON.stringify(switchMsg));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.id, socket, userId]);

  // Listen for incoming messages from the global WebSocket.
  useEffect(() => {
    if (!socket) return;

    const onMessage = (event: MessageEvent) => {
      const receivedData = JSON.parse(event.data);
      // If an array of messages (historical), merge them.
      if (Array.isArray(receivedData)) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.id));
          const newMsgs = receivedData.filter(
            (msg: any) => !existingIds.has(msg.id)
          );
          return [...newMsgs.reverse(), ...prev];
        });
      }
      // Handle channel_message.
      else if (receivedData.type === 'channel_message') {
        const msgData = receivedData.data;
        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.timestamp));
          if (!existingIds.has(msgData.timestamp)) {
            return [...prev, msgData];
          }
          return prev;
        });
        // Remove the sender from typing list if present.
        setTypingUsers((prev) =>
          prev.filter((name) => name !== msgData.username)
        );
      }
      // Handle typing indicator for channel: add the user (if not self).
      else if (
        receivedData.type === 'typing' &&
        receivedData.data.chat_type === 'channel' &&
        receivedData.data.chat_id === channel.id &&
        receivedData.data.from_user_id !== userId
      ) {
        setTypingUsers((prev) => {
          if (!prev.includes(receivedData.data.from_user_name)) {
            return [...prev, receivedData.data.from_user_name];
          }
          return prev;
        });
      }
      // Handle not_typing indicator for channel: remove the user.
      else if (
        receivedData.type === 'not_typing' &&
        receivedData.data.chat_type === 'channel' &&
        receivedData.data.chat_id === channel.id
      ) {
        setTypingUsers((prev) =>
          prev.filter((name) => name !== receivedData.data.from_user_name)
        );
      }
      // Handle notifications.
      else if (receivedData.type === 'notification') {
        showSnackbar(receivedData.message, 'success');
      }
    };

    socket.addEventListener('message', onMessage);
    return () => {
      socket.removeEventListener('message', onMessage);
    };
  }, [socket, userId, channel.id, showSnackbar]);

  // useEffect(() => {
  //   if (messagesEndRef.current) {
  //     messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [messages]);

  // Fetch historical messages via REST with URL-encoded paging_state.
  const fetchMessages = async () => {
    try {
      const encodedPagingState = encodeURIComponent(pagingState);
      const response = await goAxiosInstance.get(
        `/fetch_channel_paginated_messages?channel_id=${channel.id}&user_id=${user?.id}&paging_state=${encodedPagingState}&token=${localStorage.getItem('access_token')}`
      );
      setPagingState(response.data.paging_state);
      if (response.data.messages) {
        setMessages((prevMessages) => {
          const updatedMessages = [
            ...response.data.messages.reverse(),
            ...prevMessages,
          ];
          return updatedMessages;
        });
      }
      if (response.data.paging_state === '') {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching messages', error);
    }
  };

  const loadMoreMessages = async () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      await fetchMessages();
      setLoadingMore(false);
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (event.currentTarget.scrollTop === 0 && hasMore) {
      loadMoreMessages();
    }
  };

  // For channel, send typing/not_typing with channel details.
  const sendTypingIndicator = (isTyping: boolean) => {
    if (socket && userId) {
      const typingPayload = {
        type: isTyping ? 'typing' : 'not_typing',
        data: {
          from_user_id: userId,
          from_user_name: user?.username,
          chat_type: 'channel',
          chat_id: channel.id,
        },
      };
      socket.send(JSON.stringify(typingPayload));
    }
  };

  const handleTyping = () => {
    sendTypingIndicator(true);
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      sendTypingIndicator(false);
    }, 2000);
  };

  // Send a not_typing event on unload and on component unmount.
  useEffect(() => {
    const handleBeforeUnload = () => {
      sendTypingIndicator(false);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sendTypingIndicator(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, userId, channel.id]);

  // Existing sendMessage implementation remains unchanged.
  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

    const messagePayload = {
      type: 'channel_message',
      data: {
        sender_id: user?.id,
        username: user?.username,
        channel_id: channel.id,
        content: newMessage,
      },
    };

    socket.send(JSON.stringify(messagePayload));
    setMessages((prevMessages) => {
      const updatedMessages = [
        ...prevMessages,
        { ...messagePayload.data, id: Date.now() },
      ];
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      return updatedMessages;
    });
    setNewMessage('');
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage();
    } else {
      handleTyping();
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
          onScroll={handleScroll}
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
                            new Date(msg.created_at),
                            'MMM d, HH:mm'
                          );
                        } catch {
                          return 'Just now';
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
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-bg-tertiary hover:bg-button-hover rounded-lg transition-all duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChannelChat;
