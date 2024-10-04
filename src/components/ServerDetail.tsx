import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from '../Store';
import { useNavigate } from 'react-router-dom';

const ServerDetail: React.FC<{
  serverId: string;
  serverName: string | null;
}> = ({ serverId, serverName }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLDivElement>(null);
  const { permissions } = useSelector((state: RootState) => state.permissions);
  const navigate = useNavigate();
  const openServerSettings = () => {
    navigate(`/settings/${serverId}`);
  };

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newExpandedCategories = new Set(prev);
      if (newExpandedCategories.has(categoryId)) {
        newExpandedCategories.delete(categoryId);
      } else {
        newExpandedCategories.add(categoryId);
      }
      return newExpandedCategories;
    });
  };

  const requiredPermissions = ['SEND_MESSAGES', 'SPEAK'];
  // Example: If need to check multiple permissions at once
  //   const canPerformActions = requiredPermissions.every((permission) =>
  //     permissionSet.has(permission)
  //   );
  const permissionSet = new Set(
    permissions.map((permission) => permission.name)
  );

  // Check if the user has the required permissions
  const canSendMessages = permissionSet.has('SEND_MESSAGES');
  const canSpeak = permissionSet.has('SPEAK');
  const owner = permissionSet.has('OWNER');

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside both the dropdown and the toggle button
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Fetch categories and channels for the selected server
    axiosInstance
      .get(`/category/${serverId}`)
      .then((response) => {
        setCategories(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.log('Error fetching categories', error);
      });
  }, [serverId]); // Fetch when serverId changes

  return (
    <div className="w-64 bg-bg-tertiary h-screen py-2">
      {/* Server Name with Toggle */}
      <div
        className="mb-2 px-4 py-2 bg-secondary dark:bg-dark-secondary text-primary dark:text-dark-text-primary shadow-lg flex items-center justify-between cursor-pointer"
        ref={toggleButtonRef}
        onClick={toggleDropdown}
      >
        <span className="font-semibold">{serverName}</span>

        {/* Arrow Icon (direction changes based on dropdown state) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`w-5 h-5 text-primary dark:text-dark-text-primary transition-transform transform ${
            isDropdownOpen ? 'rotate-180' : 'rotate-0'
          }`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-30 left-1/6 transform -translate-x-1/6 w-60 bg-secondary dark:bg-dark-secondary text-primary dark:text-dark-text-primary rounded-lg shadow-lg ml-2"
        >
          {owner && (
            <div
              className="px-4 py-2 hover:bg-hover-bg dark:hover:bg-dark-hover cursor-pointer"
              onClick={openServerSettings}
            >
              Server Settings
            </div>
          )}
          <div className="px-4 py-2 hover:bg-hover-bg dark:hover:bg-dark-hover cursor-pointer">
            Create Category
          </div>
          <div className="px-4 py-2 text-red-500 hover:bg-hover-bg dark:hover:bg-dark-hover cursor-pointer">
            Leave Server
          </div>
        </div>
      )}
      {categories.map((category) => (
        <div key={category.id} className="mb-4">
          <div
            className="flex items-center justify-between px-4 cursor-pointer"
            onClick={() => toggleCategory(category.id)}
          >
            {/* Left Side: Arrow and Category Name */}
            <div className="flex items-center">
              <span
                className={`mr-2 text-secondary dark:text-dark-text-secondary0 transition-transform ${
                  expandedCategories.has(category.id) ? 'rotate-0' : 'rotate-90'
                }`}
              >
                {!expandedCategories.has(category.id) ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 15l6-6 6 6"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 9l6 6 6-6"
                    />
                  </svg>
                )}
              </span>
              <h3 className="text-sm text-secondary dark:text-dark-text-secondary">
                {category.name.toUpperCase()}
              </h3>
            </div>

            {/* "+" Icon for creating a new channel */}
            <button
              className="text-green-500 hover:text-green-700"
              onClick={(event) => event.stopPropagation()}
            >
              +
            </button>
          </div>

          {/* Show channels if the category is expanded */}
          {expandedCategories.has(category.id) && (
            <ul>
              {Array.isArray(category.channels) &&
              category.channels.length > 0 ? (
                category.channels.map((channel: any) => (
                  <li
                    key={channel.id}
                    className="text-gray-200 px-4 py-2 hover:bg-gray-600 cursor-pointer"
                  >
                    # {channel.name}
                  </li>
                ))
              ) : (
                <li className="text-gray-500 px-4 py-2">
                  No channels available
                </li>
              )}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default ServerDetail;
