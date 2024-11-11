import { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { useSnackbar } from '../Snackbar';

const ChatWindow = ({
  activeChat,
  toUserId,
}: {
  activeChat: {
    profile_picture_url: string;
    username: string;
  } | null;
  toUserId: string;
}) => {
  const user = useSelector((state: RootState) => state.user.user);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<
    {
      id: string;
      from_user_id: string;
      to_user_id: string;
      content: string;
      created_at: string;
    }[]
  >([]);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const retryInterval = useRef<number | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const { showSnackbar } = useSnackbar();
  const userId = user?.id;

  const connectWebSocket = () => {
    const wsUrl = `ws://localhost:8080?from_user_id=${userId}&to_user_id=${toUserId}&token=${localStorage.getItem('access_token')}`;
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = function () {
      console.log('WebSocket opened. Requesting initial messages...');

      // Send an initial request for chat history
      const initPayload = {
        toUserID: toUserId,
        type: 'init',
      };
      socketRef.current?.send(JSON.stringify(initPayload));
    };

    socketRef.current.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);

      // Check if it's the initial message batch or a single message
      if (Array.isArray(receivedMessage)) {
        setMessages((prevMessages) => {
          const existingMessageIds = new Set(prevMessages.map((msg) => msg.id)); // Assuming each message has a unique 'id'
          const newMessages = receivedMessage.filter(
            (msg) => !existingMessageIds.has(msg.id)
          );
          return [...newMessages.reverse(), ...prevMessages]; // Add new messages at the bottom
        });
      } else if (
        receivedMessage.type === 'typing' &&
        receivedMessage.from_user_id !== userId
      ) {
        setIsTyping(true);
        setTypingUser(receivedMessage.from_user_id);
      } else if (
        receivedMessage.type === 'not_typing' &&
        receivedMessage.from_user_id !== userId
      ) {
        setIsTyping(false);
        setTypingUser(null);
      } else {
        setMessages((prevMessages) => {
          const existingMessageIds = new Set(prevMessages.map((msg) => msg.id));
          if (!existingMessageIds.has(receivedMessage.id)) {
            return [...prevMessages, receivedMessage]; // Append only new messages
          }
          return prevMessages; // No change if the message already exists
        });
      }
    };

    socketRef.current.onclose = () => {
      setMessages([]);
      setHasMore(true);
      setPage(2);
      setLoadingMore(false);
      console.log('WebSocket closed');
      retryConnection();
    };

    socketRef.current.onerror = (error) => {
      showSnackbar(
        'An error occurred while connecting to the server! Retrying...',
        'error'
      );
      console.error('WebSocket error:', error);
      socketRef.current?.close();
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

  const sendTypingIndicator = (isTyping: boolean) => {
    if (socketRef.current) {
      const typingPayload = {
        from_user_id: userId || '',
        to_user_id: toUserId,
        type: isTyping ? 'typing' : 'not_typing',
      };
      socketRef.current.send(JSON.stringify(typingPayload));
    }
  };

  useEffect(() => {
    if (activeChat) {
      connectWebSocket();

      return () => {
        socketRef.current?.close();
        if (retryInterval.current) {
          window.clearTimeout(retryInterval.current);
        }
        if (typingTimeoutRef.current) {
          window.clearTimeout(typingTimeoutRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toUserId, activeChat, userId]);

  useEffect(() => {
    if (messages.length > 0 && page <= 2 && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, page]);

  const handleTyping = () => {
    sendTypingIndicator(true);

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      sendTypingIndicator(false);
    }, 2000);
  };

  const loadMoreMessages = async () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      try {
        const response = await fetch(
          `http://localhost:8080/fetch_paginated_messages?to_user_id=${toUserId}&page=${page}&token=${localStorage.getItem('access_token')}`
        );
        const olderMessages = await response.json();

        if (olderMessages?.length > 0) {
          setMessages((prevMessages) => [...olderMessages, ...prevMessages]);
          setPage(page + 1);
        } else {
          setHasMore(false); // No more messages to load
        }
      } catch (error) {
        showSnackbar('Error loading messages', 'error');
        console.error('Error loading more messages:', error);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      if (chatContainerRef.current.scrollTop === 0 && hasMore) {
        loadMoreMessages();
      }
      // Check if the user scrolled up to show the arrow
      setShowScrollToBottom(
        chatContainerRef.current.scrollTop <
          chatContainerRef.current.scrollHeight -
            chatContainerRef.current.clientHeight
      );
    }
  };

  const sendMessage = () => {
    if (socketRef.current && message.trim()) {
      const msg = {
        from_user_id: userId || '',
        to_user_id: toUserId,
        content: message,
      };
      socketRef.current.send(JSON.stringify(msg));
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          ...msg,
          id: `${Date.now()}`,
          created_at: new Date().toISOString(),
        },
      ]);
      setMessage('');
      setIsTyping(false);
      sendTypingIndicator(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage();
      // Scroll to the bottom after sending a message
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      handleTyping();
    }
  };

  return (
    <div className="flex-grow overflow-hidden relative bg-bg-primary dark:bg-dark-primary p-4 flex flex-col w-full pt-0">
      {activeChat ? (
        <>
          <div className="flex items-center justify-between bg-bg-primary dark:bg-dark-primary p-4 rounded-lg">
            {/* User info with avatar */}
            <div className="flex items-center space-x-3">
              <img
                src={activeChat.profile_picture_url}
                alt={activeChat.username}
                className="w-8 h-8 rounded-full"
              />
              <h2 className="text-lg text-primary dark:text-dark-text-primary font-medium">
                {activeChat.username}
              </h2>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-4">
              <button className="hover:text-primary dark:hover:text-dark-text-primary">
                <i className="fas fa-phone" />
              </button>
              <button className="hover:text-primary dark:hover:text-dark-text-primary">
                <i className="fas fa-video" />
              </button>
              <button className="hover:text-primary dark:hover:text-dark-text-primary">
                <i className="fas fa-thumbtack" />
              </button>
              <button className="hover:text-primary dark:hover:text-dark-text-primary">
                <i className="fas fa-user-plus" />
              </button>

              {/* Search bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="bg-bg-secondary dark:bg-dark-secondary text-primary dark:text-dark-text-primary rounded-lg p-2 pl-8 outline-none"
                />
                <i className="fas fa-search absolute left-2 top-2.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Chat messages */}
          <div
            ref={chatContainerRef}
            className="h-[600px] bg-gray-100 dark:bg-dark-secondary p-4 rounded-lg overflow-y-auto"
            onScroll={handleScroll}
          >
            {loadingMore && (
              <div className="text-center my-2">
                <i className="fas fa-spinner fa-spin" />
              </div>
            )}
            {messages.length === 0 ? (
              <p className="text-center text-gray-500">No messages yet...</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex mb-4 ${
                    msg.from_user_id === userId
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  {msg.from_user_id !== userId && (
                    <img
                      src={activeChat.profile_picture_url}
                      alt={activeChat.username}
                      className="w-8 h-8 rounded-full mr-2 mt-2"
                    />
                  )}
                  <div
                    className={`p-3 rounded-lg ${
                      msg.from_user_id === userId
                        ? 'bg-blue-500'
                        : 'bg-gray-500'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <span className="text-xs">
                      {(() => {
                        try {
                          return format(
                            new Date(msg.created_at),
                            'MMMM do, yyyy H:mma'
                          );
                        } catch {
                          return 'Just now';
                        }
                      })()}
                    </span>
                  </div>
                  {msg.from_user_id === userId && (
                    <img
                      src={user?.profilePicture}
                      alt={user?.profilePicture}
                      className="w-8 h-8 rounded-full ml-2 mt-2"
                    />
                  )}
                </div>
              ))
            )}
            <div ref={messageEndRef} />
            {showScrollToBottom && (
              <button
                onClick={() => {
                  chatContainerRef.current?.scrollTo({
                    top: chatContainerRef.current.scrollHeight,
                    behavior: 'smooth',
                  });
                  setShowScrollToBottom(false);
                }}
                className="w-10 absolute left-1/2 transform -translate-x-1/2 bottom-[130px] bg-tertiary dark:bg-dark-tertiary  hover:bg-button-hover dark:hover:bg-dark-button-hover rounded-full p-2 shadow-lg" // Positioned above textarea
              >
                <i className="fas fa-arrow-down" />
              </button>
            )}
          </div>

          {isTyping && typingUser && (
            <div className="text-gray-500 mt-2 animate-pulse">
              {activeChat.username} is typing...
            </div>
          )}

          <div
            className={`${isTyping && typingUser ? '' : 'mt-4'} flex items-center space-x-2`}
          >
            <input
              type="text"
              value={message}
              placeholder="Type a message..."
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-grow p-3 rounded-lg bg-bg-secondary dark:bg-dark-secondary outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-bg-secondary hover:bg-button-hover rounded-lg px-5 py-3 transition-all duration-200"
            >
              Send
            </button>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ChatWindow;
