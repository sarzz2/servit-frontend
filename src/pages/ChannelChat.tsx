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
  const [page, setPage] = useState(1);
  const socketRef = useRef<WebSocket | null>(null);
  const { showSnackbar } = useSnackbar();
  const user = useSelector((state: RootState) => state.user.user);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const retryInterval = useRef<number | null>(null);

  // WebSocket connection managed on channel change
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        console.log('Closing WebSocket on channel switch');
        socketRef.current.close();
        if (retryInterval.current) {
          window.clearTimeout(retryInterval.current);
        }
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.id]);

  const connectWebSocket = () => {
    const wsUrl = `ws://localhost:8080/ws/channel?channel_id=${channel.id}&user_id=${user?.id}&token=${localStorage.getItem('access_token')}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('WebSocket opened.');
      setMessages([]);
      setPage(1);
      fetchMessages(1);
    };

    socket.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);
      handleNewMessage(receivedMessage);
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
    };

    socket.onerror = (error) => {
      showSnackbar(
        'An error occurred while connecting to the server! Retrying...',
        'error'
      );
      retryConnection();
      console.error('WebSocket error:', error);
    };
  };

  const retryConnection = () => {
    if (retryInterval.current) return; // Prevent multiple retries

    retryInterval.current = window.setTimeout(() => {
      console.log('Retrying WebSocket connection...');
      connectWebSocket();
      retryInterval.current = null;
    }, 3000);
  };

  const handleNewMessage = (messageData: any) => {
    if (Array.isArray(messageData)) {
      setMessages((prevMessages) => {
        const existingMessageIds = new Set(prevMessages.map((msg) => msg.id));
        const newMessages = messageData.filter(
          (msg) => !existingMessageIds.has(msg.id)
        );
        return [...newMessages.reverse(), ...prevMessages];
      });
    } else {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, messageData];
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        return updatedMessages;
      });
    }
  };

  useEffect(() => {
    if (messagesEndRef.current && page === 1) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, page]);

  const fetchMessages = async (pageToFetch: number) => {
    try {
      const response = await goAxiosInstance.get(
        `/fetch_channel_messages?channel_id=${channel.id}&user_id=${user?.id}&token=${localStorage.getItem('access_token')}&page=${pageToFetch}`
      );
      if (response.data) {
        setMessages((prevMessages) => {
          const updatedMessages = [...response.data.reverse(), ...prevMessages];
          if (messagesEndRef.current && pageToFetch === 1) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          }
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error('Error fetching messages', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;

    const messagePayload = {
      user_id: user?.id,
      username: user?.username,
      content: newMessage,
    };

    socketRef.current.send(JSON.stringify(messagePayload));
    setMessages((prevMessages) => {
      const updatedMessages = [
        ...prevMessages,
        { ...messagePayload, id: Date.now() },
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
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (event.currentTarget.scrollTop === 0) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMessages(nextPage);
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
        <div className="flex-grow overflow-y-auto" onScroll={handleScroll}>
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">No messages yet...</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex mb-4 ${
                  msg.user_id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.user_id !== user?.id ? (
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
                    msg.user_id === user?.id ? 'bg-blue-500' : 'bg-gray-500'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    <span className="text-sm font-semibold mr-2">
                      {msg.user_id === user?.id ? user?.username : msg.username}
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
                {msg.user_id === user?.id &&
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
