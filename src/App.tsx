import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import AuthPopup from './components/Auth/AuthPopup';
import { useTheme } from './contexts/ThemeContext';
import { useDispatch } from 'react-redux';
import { setUser, finishLoading } from './slices/userSlice';
import axiosInstance from './utils/axiosInstance';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ServerSettings from './components/ServerSettings/ServerSettings';
import { SnackbarProvider } from './components/Snackbar';
import PermissionRoute from './components/PermissionRoute';
import ServerDetail from './components/Server/ServerDetail';
import DirectMessage from './components/DirectMessage/DirectMessage';
import ServerLayout from './pages/ServerLayout';
import LoginPage from './pages/LoginPage';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { setUserOnlineStatus } from './slices/onlineStatusSlice';
import { goAxiosInstance } from './utils/axiosInstance';

const App: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const location = useLocation();

  const fetchInitialOnlineStatuses = async () => {
    goAxiosInstance
      .get(`/friends/online?token=${localStorage.getItem('access_token')}`)
      .then((response) => {
        if (response.data) {
          response.data.forEach(
            (status: { userId: string; status: boolean }) => {
              dispatch(
                setUserOnlineStatus({
                  userId: status.userId,
                  status: status.status,
                })
              );
            }
          );
        }
      })
      .catch((error) => {
        console.error('Error fetching initial online statuses', error);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axiosInstance
        .get('/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          dispatch(
            setUser({
              email: response.data.email,
              username: response.data.username,
              id: response.data.id,
              profilePicture: response.data.profile_picture_url,
            })
          );
          fetchInitialOnlineStatuses();

          const socket = new WebSocket(
            `ws://127.0.0.1:8080/ws/online?token=${token}`
          );

          // Listen for online status updates
          socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            dispatch(
              setUserOnlineStatus({ userId: data.userId, status: data.status })
            );
          };
          return () => {
            socket.close();
          };
        })
        .catch(async (error) => {
          if (error.response && error.response.status === 401) {
            // Attempt to refresh the access token
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              try {
                const refreshResponse = await axiosInstance.post(
                  '/users/token/refresh',
                  {},
                  {
                    headers: {
                      'refresh-token': refreshToken,
                    },
                  }
                );

                // Store the new access token
                const newAccessToken = refreshResponse.data.access_token;
                localStorage.setItem('access_token', newAccessToken);
                localStorage.setItem(
                  'refresh_token',
                  refreshResponse.data.refresh_token
                );

                const retryResponse = await axiosInstance.get('/users/me', {
                  headers: {
                    Authorization: `Bearer ${newAccessToken}`,
                  },
                });

                // Update Redux state with new user data
                dispatch(
                  setUser({
                    email: retryResponse.data.email,
                    username: retryResponse.data.username,
                    id: retryResponse.data.id,
                    profilePicture: retryResponse.data.profile_picture_url,
                  })
                );

                fetchInitialOnlineStatuses();
              } catch (refreshError) {
                // If refresh token has expired or is invalid
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                dispatch(finishLoading());
                // showSnackbar('Session expired. Please log in again.', 'error');
              }
            } else {
              // No refresh token available
              dispatch(finishLoading());
            }
          } else {
            console.error('Error fetching user data:', error);
            dispatch(finishLoading());
          }
        });
    } else {
      dispatch(finishLoading());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <div className={`flex flex-col min-h-screen ${theme}`}>
      <SnackbarProvider>
        <AuthPopup />

        {(location.pathname === '/' || location.pathname === '/login') && (
          <Header />
        )}

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Routes that require authentication */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <ServerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="direct" element={<DirectMessage />} />
              <Route path=":serverId" element={<ServerDetail />}></Route>
            </Route>

            <Route
              path="/settings/:serverId"
              element={
                <ProtectedRoute>
                  <PermissionRoute
                    requiredPermissions={[
                      'MANAGE_SERVER',
                      'MANAGE_CHANNELS',
                      'OWNER',
                    ]}
                  >
                    <ServerSettings />
                  </PermissionRoute>
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {(location.pathname === '/' || location.pathname === '/login') && (
          <Footer />
        )}
      </SnackbarProvider>
    </div>
  );
};
const AppWrapper: React.FC = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;
