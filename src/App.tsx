import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import UserPage from './pages/UserPage';
import AuthPopup from './components/AuthPopup';
import { useTheme } from './contexts/ThemeContext';
import { useDispatch } from 'react-redux';
import { setUser } from './slices/userSlice';
import axiosInstance from './utils/axiosInstance';

const App: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();

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
            })
          );
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    }
  }, [dispatch]);

  return (
    <Router>
      <div className={`flex flex-col min-h-screen ${theme}`}>
        <AuthPopup />
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/user" element={<UserPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
