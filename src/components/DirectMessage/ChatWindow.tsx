import { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store';
import { useSnackbar } from '../Snackbar';
import { goAxiosInstance } from '../../utils/axiosInstance';

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
      sender_id: string;
      receiver_id: string;
      content: string;
      timestamp: string;
    }[]
  >([]);
  const [pagingState, setPagingState] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socket = useSelector((state: RootState) => state.ws.connection);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const { showSnackbar } = useSnackbar();
  const userId = user?.id;

  // When the chat is opened (or toUserId/activeChat changes), fetch messages and send a switch_chat event.
  useEffect(() => {
    fetchMessages();
    if (socket && activeChat && userId) {
      const switchPayload = {
        type: 'switch_chat',
        data: { chat_type: 'dm', chat_id: toUserId },
      };
      socket.send(JSON.stringify(switchPayload));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, toUserId, activeChat, userId]);

  // Listen for incoming messages from the global WebSocket.
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const received = JSON.parse(event.data);

      // Handle historical messages (array)
      if (Array.isArray(received)) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.id));
          const newMsgs = received.filter(
            (msg: any) => !existingIds.has(msg.id)
          );
          return [...newMsgs.reverse(), ...prev];
        });
      }
      // Handle direct_message type
      else if (received.type === 'direct_message') {
        const messageData = received.data;
        setMessages((prev) => {
          const existingIds = new Set(prev.map((msg) => msg.id));
          if (!existingIds.has(messageData.id)) {
            return [
              ...prev,
              {
                id: messageData.id || Date.now().toString(),
                sender_id: messageData.sender_id,
                receiver_id: messageData.receiver_id,
                content: messageData.content,
                timestamp: messageData.timestamp || new Date().toISOString(),
              },
            ];
          }
          return prev;
        });
      }
      // Handle typing indicators for DM
      else if (received.type === 'typing') {
        if (received.from_user_id !== userId) {
          setIsTyping(true);
          setTypingUser(received.from_user_id);
        }
      }
      // Handle not_typing indicator
      else if (received.type === 'not_typing') {
        if (received.from_user_id !== userId) {
          setIsTyping(false);
          setTypingUser(null);
        }
      }
      // Handle notifications
      else if (received.type === 'notification') {
        showSnackbar(received.message, 'success');
      }
      // Reset typing state for any other messages
      else {
        setIsTyping(false);
        setTypingUser(null);
      }
    };
    socket.addEventListener('message', handleMessage);
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, userId]);

  // Add beforeunload listener and cleanup to send not_typing event when tab/chat closes.
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
  }, [socket, userId]);

  // Fetch historical messages via REST
  const fetchMessages = async () => {
    const encodedPagingState = encodeURIComponent(pagingState);

    try {
      const response = await goAxiosInstance.get(
        `http://localhost:8080/fetch_paginated_messages?to_user_id=${toUserId}&paging_state=${encodedPagingState}&token=${localStorage.getItem(
          'access_token'
        )}`
      );

      const olderMessages = response.data.messages;
      setPagingState(response.data.paging_state);
      if (olderMessages?.length > 0) {
        setMessages((prev) => [...olderMessages.reverse(), ...prev]);
      }
      if (response.data.paging_state === '') {
        setHasMore(false);
      }
    } catch (error) {
      showSnackbar('Error loading messages', 'error');
      console.error('Error loading more messages:', error);
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      if (chatContainerRef.current.scrollTop === 0 && hasMore) {
        loadMoreMessages();
      }
      setShowScrollToBottom(
        chatContainerRef.current.scrollTop <
          chatContainerRef.current.scrollHeight -
            chatContainerRef.current.clientHeight
      );
    }
  };

  const loadMoreMessages = async () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      await fetchMessages();
      setLoadingMore(false);
    }
  };

  // Send typing indicator using the WSMessage payload structure.
  const sendTypingIndicator = (isTyping: boolean) => {
    if (socket && userId) {
      const typingPayload = {
        type: isTyping ? 'typing' : 'not_typing',
        data: {
          chat_type: 'dm',
          from_user_id: userId,
          to_user_id: toUserId,
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

  // Existing sendMessage implementation remains unchanged.
  const sendMessage = () => {
    if (socket && message.trim() && userId) {
      const dmMessage = {
        type: 'direct_message',
        data: {
          sender_id: userId,
          receiver_id: toUserId,
          content: message,
          timestamp: new Date().toISOString(),
        },
      };
      socket.send(JSON.stringify(dmMessage));
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          sender_id: dmMessage.data.sender_id,
          receiver_id: dmMessage.data.receiver_id,
          content: dmMessage.data.content,
          timestamp: new Date().toISOString(),
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
                    msg.sender_id === userId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender_id !== userId && (
                    <img
                      src={activeChat.profile_picture_url}
                      alt={activeChat.username}
                      className="w-8 h-8 rounded-full mr-2 mt-2"
                    />
                  )}
                  <div
                    className={`p-3 rounded-lg ${
                      msg.sender_id === userId ? 'bg-blue-500' : 'bg-gray-500'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <span className="text-xs">
                      {(() => {
                        try {
                          return format(
                            new Date(msg.timestamp),
                            'MMMM do, yyyy H:mma'
                          );
                        } catch {
                          return 'Just now';
                        }
                      })()}
                    </span>
                  </div>
                  {msg.sender_id === userId && (
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
                className="w-10 absolute left-1/2 transform -translate-x-1/2 bottom-[130px] bg-tertiary dark:bg-dark-tertiary hover:bg-button-hover dark:hover:bg-dark-button-hover rounded-full p-2 shadow-lg"
              >
                <i className="fas fa-arrow-down" />
              </button>
            )}
          </div>
          {isTyping && (
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
