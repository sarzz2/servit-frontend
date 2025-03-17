import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setConnection } from '../slices/wsSlice';
import { RootState } from '../Store';

interface WebSocketProviderProps {
  children: React.ReactNode;
}

const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const loggedIn = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  const userId = useSelector((state: RootState) => state.user.user?.id);
  const username = useSelector((state: RootState) => state.user.user?.username);
  const activeChat = useSelector((state: RootState) => state.ws.activeChat);
  const lastVisitedChat = useSelector(
    (state: RootState) => state.ws.lastVisitedChat
  );

  useEffect(() => {
    if (loggedIn && userId && username) {
      let ws: WebSocket | null = null;
      let reconnectTimeout: number;

      const connectWebSocket = () => {
        ws = new WebSocket(
          `ws://localhost:8080/ws?token=${localStorage.getItem('access_token')}`
        );

        ws.onopen = () => {
          console.log('WebSocket connected');
          // Send initial switch_chat message if available.
          const chatToUse = activeChat || lastVisitedChat;
          if (chatToUse) {
            const switchChatMsg = {
              type: 'switch_chat',
              data: chatToUse,
            };
            ws?.send(JSON.stringify(switchChatMsg));
          }
        };

        ws.onerror = (err) => {
          console.error('WebSocket error', err);
        };

        ws.onclose = () => {
          console.log(
            'WebSocket disconnected, attempting to reconnect in 5 seconds...'
          );
          reconnectTimeout = window.setTimeout(() => {
            connectWebSocket();
          }, 5000);
        };

        dispatch(setConnection(ws));
      };

      connectWebSocket();

      // Cleanup on unmount: close connection and clear timeout.
      return () => {
        if (ws) ws.close();
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
      };
    }
  }, [loggedIn, userId, username, activeChat, lastVisitedChat, dispatch]);

  return <>{children}</>;
};

export default WebSocketProvider;
