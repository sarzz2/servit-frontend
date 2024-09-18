import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openModal } from '../slices/authModalSlice';
import { RootState } from '../Store';
import { useSelector } from 'react-redux';
import { logout } from '../slices/userSlice';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.user.user);
  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-opacity-90 backdrop-blur-md"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
        </Link>
        <nav className="hidden md:flex space-x-8">
          <Link
            to="/"
            className="hover:text-accent-color transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            Home
          </Link>
          <Link
            to="/about"
            className="hover:text-accent-color transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            About
          </Link>
          <Link
            to="/contact"
            className="hover:text-accent-color transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-opacity-10 hover:bg-accent-color transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          {isAuthenticated ? (
            <button
              className="px-4 py-2 text-sm font-medium hover:bg-opacity-10 hover:bg-accent-color rounded-md transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onClick={handleLogout}
            >
              Log Out
            </button>
          ) : (
            <div>
              <button
                className="px-4 py-2 text-sm font-medium hover:bg-opacity-10 hover:bg-accent-color rounded-md transition-colors"
                style={{ color: 'var(--text-primary)' }}
                onClick={() => dispatch(openModal('login'))}
              >
                Log In
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-accent-color hover:bg-opacity-90 rounded-md transition-colors"
                onClick={() => dispatch(openModal('signup'))}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
