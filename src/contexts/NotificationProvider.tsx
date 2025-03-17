// NotificationProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from '../Store';

export type NotificationPreference = 'all' | 'mentions' | 'none';

export interface NotificationEvent {
  server_id: string;
  channel_id: string;
  message: string;
  chat_type: string;
  type: 'message' | 'mention';
  unread: number;
}

export interface NotificationsState {
  // Map of server id to notifications data.
  [serverId: string]: {
    serverCount: number;
    channels: {
      [channelId: string]: {
        count: number;
        events: NotificationEvent[];
      };
    };
  };
}

// Model representing a counter update to be sent to the backend.
export interface NotificationCounterUpdate {
  server_id: string;
  channel_id: string;
  unread_count: number;
  mention_count: number;
  user_id: string;
}

interface NotificationContextProps {
  notifications: NotificationsState;
  clearServerNotifications: (serverId: string, channelId: string) => void;
  clearChannelNotifications: (serverId: string, channelId: string) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

interface NotificationProviderProps {
  socket: WebSocket | null;
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  socket,
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationsState>({});
  const [pendingUpdates, setPendingUpdates] = useState<
    NotificationCounterUpdate[]
  >([]);
  const userId = useSelector((state: RootState) => state.user.user?.id);
  const serverPreferences = useSelector(
    (state: RootState) => state.notification.preferences
  );

  // Fetch persistent notifications on mount.
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get(
          `/servers/notification/counters/${userId}`
        );
        const transformedData: NotificationsState = {};

        response.data.forEach(
          (item: {
            server_id: string;
            channel_id: string;
            unread_count: number;
            mention_count: number;
          }) => {
            const { server_id, channel_id, unread_count, mention_count } = item;
            if (!transformedData[server_id]) {
              transformedData[server_id] = {
                serverCount: 0,
                channels: {},
              };
            }
            // Build a single aggregated event.
            transformedData[server_id].channels[channel_id] = {
              count: unread_count,
              events: [
                {
                  server_id,
                  channel_id,
                  message: '',
                  chat_type: 'channel',
                  type: mention_count > 0 ? 'mention' : 'message',
                  // Use the total unread count.
                  unread: unread_count,
                },
              ],
            };
            transformedData[server_id].serverCount += unread_count;
          }
        );

        setNotifications(transformedData);
      } catch (error) {
        console.error('Error loading notifications', error);
      }
    };

    fetchNotifications();
  }, [userId, serverPreferences]);

  // Batch flush pending updates every 5 seconds.
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingUpdates.length > 0) {
        const backendPayload = { updates: pendingUpdates };
        axiosInstance
          .post('/servers/notification/counters', backendPayload)
          .then(() => {
            setPendingUpdates([]);
          })
          .catch((error) => {
            console.error('Error persisting notification updates', error);
            setPendingUpdates([]);
          });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [pendingUpdates]);

  // Flush pending updates when the user is about to leave the page.
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingUpdates.length > 0) {
        const payload = JSON.stringify({ updates: pendingUpdates });
        navigator.sendBeacon('/servers/notification/counters', payload);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pendingUpdates]);

  // Listen for WS notification events and accumulate them.
  useEffect(() => {
    if (!socket) return;

    const onMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log('WS notification event:', data);
      if (data) {
        // Build a NotificationEvent from WS data.
        const payload: NotificationEvent = {
          server_id: data.server_id,
          channel_id: data.channel_id,
          message: data.message,
          type: data.type, // "message" or "mention"
          chat_type: data.chat_type,
          unread: data.unread,
        };

        // Get the current preference from Redux.
        const preference: NotificationPreference =
          serverPreferences[data.server_id] || 'all';

        // Build a counter update object.
        const counterUpdate: NotificationCounterUpdate = {
          server_id: data.server_id,
          channel_id: data.channel_id,
          unread_count: data.unread,
          mention_count: data.type === 'mention' ? 1 : 0,
          user_id: userId!,
        };

        // Update pendingUpdates based on the preference.
        if (preference === 'all') {
          // For "all": push every event separately.
          setPendingUpdates((prev) => [...prev, counterUpdate]);
        } else if (preference === 'mentions' || preference === 'none') {
          setPendingUpdates((prev) => {
            const index = prev.findIndex(
              (update) =>
                update.server_id === data.server_id &&
                update.channel_id === data.channel_id &&
                update.user_id === userId
            );
            if (index !== -1) {
              const updated = [...prev];
              // For non-mention events, if an update already exists, do nothing.
              if (data.type === 'mention') {
                updated[index].mention_count += 1;
                updated[index].unread_count = 1;
              }
              return updated;
            } else {
              // No update exists for this server/channel.
              const newUpdate: NotificationCounterUpdate = {
                server_id: data.server_id,
                channel_id: data.channel_id,
                unread_count: 1,
                mention_count: data.type === 'mention' ? 1 : 0,
                user_id: userId!,
              };
              return [...prev, newUpdate];
            }
          });
        }

        // Update local notifications state.
        setNotifications((prev) => {
          const serverData = prev[payload.server_id] || {
            serverCount: 0,
            channels: {},
          };
          const channelData = serverData.channels[payload.channel_id] || {
            count: 0,
            events: [],
          };

          let aggregatedEvent;
          if (preference === 'all' || preference === 'mentions') {
            const audio = new Audio('/discord-notification.mp3');
            audio
              .play()
              .catch((error) => console.error('Error playing sound', error));
          }

          if (
            (preference === 'mentions' || preference === 'none') &&
            data.type === 'mention'
          ) {
            if (channelData.events.length > 0) {
              aggregatedEvent = { ...channelData.events[0] };
              // Increment the unread count by 1.
              aggregatedEvent.unread = aggregatedEvent.unread + 1;
              // For "mentions" preference, if the event is a mention, set type to "mention".
              if (data.type === 'mention') {
                aggregatedEvent.type = 'mention';
              }
            } else {
              aggregatedEvent = { ...payload };
            }

            const updatedChannel = {
              count: channelData.count + 1,
              events: [aggregatedEvent],
            };

            const updatedServer = {
              serverCount: serverData.serverCount + 1,
              channels: {
                ...serverData.channels,
                [payload.channel_id]: updatedChannel,
              },
            };
            return {
              ...prev,
              [payload.server_id]: updatedServer,
            };
          } else if (preference === 'all') {
            if (channelData.events.length > 0) {
              aggregatedEvent = { ...channelData.events[0] };
              aggregatedEvent.unread = aggregatedEvent.unread + 1;
              if (data.type === 'mention') {
                aggregatedEvent.type = 'mention';
              }
            } else {
              aggregatedEvent = { ...payload };
            }

            const updatedChannel = {
              count: channelData.count + 1,
              events: [aggregatedEvent],
            };

            const updatedServer = {
              serverCount: serverData.serverCount + 1,
              channels: {
                ...serverData.channels,
                [payload.channel_id]: updatedChannel,
              },
            };
            return {
              ...prev,
              [payload.server_id]: updatedServer,
            };
          } else {
            return {
              ...prev,
            };
          }
        });
      }
    };

    socket.addEventListener('message', onMessage);
    return () => {
      socket.removeEventListener('message', onMessage);
    };
  }, [socket, userId, serverPreferences]);

  // Clear notifications for a server.
  const clearServerNotifications = (serverId: string, channelId: string) => {
    axiosInstance
      .delete(`/servers/notification/clear/${serverId}/${channelId}/${userId}`)
      .catch((error) =>
        console.error('Error clearing server notifications', error)
      );

    setNotifications((prev) => ({
      ...prev,
      [serverId]: { serverCount: 0, channels: {} },
    }));
  };

  // Clear notifications for a channel.
  const clearChannelNotifications = (serverId: string, channelId: string) => {
    const serverData = notifications[serverId];
    const channelCount = serverData?.channels[channelId]?.count || 0;

    axiosInstance
      .delete(`/servers/notification/clear/${serverId}/${channelId}/${userId}`)
      .catch((error) =>
        console.error('Error clearing channel notifications', error)
      );

    setNotifications((prev) => {
      if (!prev[serverId]) return prev;
      return {
        ...prev,
        [serverId]: {
          serverCount: prev[serverId].serverCount - channelCount,
          channels: {
            ...prev[serverId].channels,
            [channelId]: { count: 0, events: [] },
          },
        },
      };
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        clearServerNotifications,
        clearChannelNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};
