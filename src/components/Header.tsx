import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const user = useSelector((state: RootState) => state.user.user);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleDropdown = () => {
    if (isDropdownOpen) {
      setIsDropdownOpen(false);
    } else {
      setIsDropdownOpen(true);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    // Add event listener for clicks outside of dropdown
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      // Clean up event listener on component unmount
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-opacity-90 backdrop-blur-md "
      style={{ backgroundColor: 'var(--bg-primary, rgba(255, 255, 255, 0.9))' }}
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
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="relative flex items-center space-x-2 focus:outline-none"
              >
                <img
                  src={user?.profilePicture || 'https://via.placeholder.com/40'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {user?.username}
                </span>
              </button>
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-20"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                  ref={dropdownRef}
                >
                  <ul className="py-2">
                    <li>
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        style={{
                          color: 'var(--text-primary)',
                          backgroundColor: 'transparent',
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            'var(--hover-bg)')
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            'transparent')
                        }
                      >
                        Profile
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-red-600"
                        style={{
                          backgroundColor: 'transparent',
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            'var(--hover-bg)')
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            'transparent')
                        }
                      >
                        Log Out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
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
