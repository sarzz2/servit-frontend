import React, { createContext, useState, useEffect, useContext } from 'react';
import { goAxiosInstance } from '../utils/axiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from '../Store';

interface ChatContextProps {
  messages: any[];
  sendMessage: (content: string) => void;
  typingUsers: string[];
  sendTypingIndicator: (isTyping: boolean) => void;
  fetchMoreMessages: () => void;
  hasMore: boolean;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{
  channel: any;
  server: any;
  socket: WebSocket;
  user: any;
  children: React.ReactNode;
}> = ({ channel, server, socket, user, children }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [pagingState, setPagingState] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Get the notification preference for the current server from Redux.
  const rawPreference = useSelector(
    (state: RootState) => state.notification.preferences[server.id]
  );
  const preference = rawPreference || 'all';

  // Fetch historical messages (paginated).
  const fetchMessages = async (change: boolean = false) => {
    try {
      var encodedPagingState;
      if (!change) {
        encodedPagingState = encodeURIComponent(pagingState);
      } else {
        encodedPagingState = '';
      }
      const response = await goAxiosInstance.get(
        `/fetch_channel_paginated_messages?channel_id=${channel.id}&user_id=${user.id}&paging_state=${encodedPagingState}&token=${localStorage.getItem('access_token')}`
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

  const fetchMoreMessages = () => {
    if (hasMore) {
      fetchMessages();
    }
  };

  // On channel switch, reset state, fetch historical messages, and send switch_chat WS command.
  const sendSwitchChat = async () => {
    if (socket && socket.readyState === WebSocket.OPEN && user.id) {
      const switchMsg = {
        type: 'switch_chat',
        data: {
          chat_type: 'channel',
          chat_id: channel.id,
          server_id: server.id,
        },
      };
      socket.send(JSON.stringify(switchMsg));
    }
  };

  useEffect(() => {
    // When channel changes, clear previous messages and reset paging.
    setMessages([]);
    setPagingState('');
    setHasMore(true);
    sendSwitchChat();
    fetchMessages(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.id]);

  // Listen to WS messages centrally.
  useEffect(() => {
    if (!socket) return;
    const onMessage = (event: MessageEvent) => {
      const receivedData = JSON.parse(event.data);
      if (receivedData.type === 'channel_message') {
        const msgData = receivedData.data;
        if (msgData.channel_id === channel.id) {
          setMessages((prev) => {
            const existingTimestamps = new Set(
              prev.map((msg) => msg.timestamp)
            );
            if (!existingTimestamps.has(msgData.timestamp)) {
              return [...prev, msgData];
            }
            return prev;
          });
          // Remove the sender from the typing indicators.
          setTypingUsers((prev) =>
            prev.filter((name) => name !== msgData.username)
          );
        }
      }
      // Typing indicator: add user if not already present.
      else if (
        receivedData.type === 'typing' &&
        receivedData.data.chat_type === 'channel' &&
        receivedData.data.chat_id === channel.id &&
        receivedData.data.from_user_id !== user.id
      ) {
        setTypingUsers((prev) => {
          if (!prev.includes(receivedData.data.from_user_name)) {
            return [...prev, receivedData.data.from_user_name];
          }
          return prev;
        });
      }
      // Remove typing indicator.
      else if (
        receivedData.type === 'not_typing' &&
        receivedData.data.chat_type === 'channel' &&
        receivedData.data.chat_id === channel.id
      ) {
        setTypingUsers((prev) =>
          prev.filter((name) => name !== receivedData.data.from_user_name)
        );
      }
    };

    socket.addEventListener('message', onMessage);
    return () => {
      socket.removeEventListener('message', onMessage);
    };
  }, [socket, channel.id, user.id]);

  // Send a chat message.
  const sendMessage = (content: string) => {
    if (!content.trim() || !socket) return;
    const messagePayload = {
      type: 'channel_message',
      data: {
        sender_id: user.id,
        username: user.username,
        channel_id: channel.id,
        server_id: server.id,
        preference: preference,
        content: content,
      },
    };

    socket.send(JSON.stringify(messagePayload));
    setMessages((prev) => [
      ...prev,
      { ...messagePayload.data, id: Date.now() },
    ]);
  };

  // Send typing (or not_typing) events.
  const sendTypingIndicator = (isTyping: boolean) => {
    if (socket && user.id) {
      const typingPayload = {
        type: isTyping ? 'typing' : 'not_typing',
        data: {
          from_user_id: user.id,
          from_user_name: user.username,
          chat_type: 'channel',
          chat_id: channel.id,
        },
      };
      socket.send(JSON.stringify(typingPayload));
    }
  };

  // On unload (or when this provider unmounts), send a not_typing event.
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
  }, [socket, user.id, channel.id]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        typingUsers,
        sendTypingIndicator,
        fetchMoreMessages,
        hasMore,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
