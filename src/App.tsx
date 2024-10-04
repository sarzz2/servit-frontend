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
import AuthPopup from './components/AuthPopup';
import { useTheme } from './contexts/ThemeContext';
import { useDispatch } from 'react-redux';
import { setUser } from './slices/userSlice';
import axiosInstance from './utils/axiosInstance';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import UserHome from './pages/UserHome';
import ServerSettings from './components/ServerSettings';

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
    }
  }, [dispatch]);

  return (
    <div className={`flex flex-col min-h-screen ${theme} `}>
      <AuthPopup />

      {/* Only render Header and Footer if not on the home route */}
      {location.pathname === '/' && <Header />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/home" element={<UserHome />} />
          <Route path="/settings/:serverId" element={<ServerSettings />} />
        </Routes>
      </main>

      {location.pathname !== '/home' && <Footer />}
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
