import { RootState } from '../../Store';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../slices/userSlice';

const UserBar: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setIsPopupOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full absolute bottom-0 flex items-center p-2 rounded-lg bg-bg-secondary dark:bg-dark-secondary">
      <div className="relative">
        <img
          src={user?.profilePicture}
          alt={`${user?.username}'s profile`}
          className="w-10 h-10 rounded-full mr-4"
        />
        <span className="absolute bottom-0 right-4 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></span>
      </div>

      {/* Username and Status */}
      <div className="flex-2">
        <p className="font-medium">{user?.username}</p>
        <p className="text-xs text-gray-500">Online</p>
      </div>

      {/* Mute and Settings Icons */}
      <div className="flex items-center space-x-2 ml-auto relative">
        <button className="p-1 rounded-full">
          <i className="fas fa-bell-slash"></i>
        </button>

        <button className="p-1 rounded-full" onClick={togglePopup}>
          <i className="fas fa-cog"></i>
        </button>

        {isPopupOpen && (
          <div
            ref={popupRef}
            className="absolute bottom-12 right-0 w-48 shadow-lg rounded-lg bg-bg-secondary dark:bg-dark-secondary"
          >
            <ul>
              <li
                className="p-3 cursor-pointer hover:bg-hover-bg"
                onClick={() => navigate('/profile')}
              >
                User Profile
              </li>
              <li className="p-3 cursor-pointer hover:bg-hover-bg">Settings</li>
              <li
                className="p-3 cursor-pointer text-red-600 hover:bg-hover-bg"
                onClick={handleLogout}
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBar;
