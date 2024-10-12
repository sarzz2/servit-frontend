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
import '@fortawesome/fontawesome-free/css/all.min.css';

const App: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const location = useLocation(); // Hook to get the current location

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
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    } else {
      dispatch(finishLoading()); // Ensures the app knows loading is done
    }
  }, [dispatch]);

  return (
    <div className={`flex flex-col min-h-screen ${theme}`}>
      <SnackbarProvider>
        <AuthPopup />

        {location.pathname === '/' && <Header />}

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />

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

        {location.pathname === '/' && <Footer />}
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
