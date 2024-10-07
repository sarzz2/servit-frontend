import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { useSelector } from 'react-redux';
import { RootState } from '../Store';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from './Snackbar';
import CreateCategoryModal from './ServerSettings/CreateCategoryModal';
import ConfirmationDialog from './ConfirmationDialog'; // Import your confirmation dialog

const ServerDetail: React.FC<{ server: any }> = ({ server }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLDivElement>(null);
  const { permissions } = useSelector((state: RootState) => state.permissions);
  const { showSnackbar } = useSnackbar();
  const [newCategoryNameModal, setNewCategoryNameModal] =
    useState<boolean>(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [isOwnerLeaving, setIsOwnerLeaving] = useState<boolean>(false);
  const navigate = useNavigate();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Check permissions
  const permissionSet = new Set(
    permissions.map((permission) => permission.name)
  );
  const canManageChannels = permissionSet.has('MANAGE_CHANNELS');
  const canManageServer = permissionSet.has('MANAGE_SERVER');
  const owner = permissionSet.has('OWNER');

  // Fetch categories on server change
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server.id]);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get(`/category/${server.id}`);
      setCategories(response.data);
    } catch (error) {
      console.log('Error fetching categories', error);
    }
  };

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

  const handleLeaveServer = () => {
    // Open confirmation dialog
    setIsOwnerLeaving(owner); // Set state to check if the user is the owner
    setConfirmDialogOpen(true);
  };

  const confirmLeaveServer = async () => {
    try {
      await axiosInstance.post(`/servers/leave/${server.id}`);
      showSnackbar('Left server successfully', 'success');
      // window.location.reload();
      navigate('/home');
    } catch (error) {
      showSnackbar('Error leaving server', 'error');
      console.error('Error leaving server:', error);
    } finally {
      setConfirmDialogOpen(false);
    }
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const closeDropdown = () => setDropdownOpen(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  return (
    <div className="w-64 bg-bg-tertiary h-screen py-2">
      {/* Server Name with Toggle */}
      <div
        className="mb-2 px-4 py-2 bg-bg-secondary dark:bg-dark-secondary text-primary dark:text-dark-text-primary shadow-lg flex items-center justify-between cursor-pointer"
        ref={toggleButtonRef}
        onClick={toggleDropdown}
      >
        <span className="font-semibold">{server.name}</span>
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
          className="absolute z-30 left-1/6 transform -translate-x-1/6 w-60 bg-bg-secondary dark:bg-dark-secondary text-primary dark:text-dark-text-primary rounded-lg shadow-lg ml-2"
        >
          {owner && (
            <div
              className="px-4 py-2 hover:bg-hover-bg dark:hover:bg-dark-hover cursor-pointer"
              onClick={() => navigate(`/settings/${server.id}`)}
            >
              Server Settings
            </div>
          )}
          {(canManageChannels || canManageServer || owner) && (
            <div
              className="px-4 py-2 hover:bg-hover-bg dark:hover:bg-dark-hover cursor-pointer"
              onClick={() => setNewCategoryNameModal(true)}
            >
              Create Category
            </div>
          )}
          <div
            className="px-4 py-2 text-red-500 hover:bg-hover-bg dark:hover:bg-dark-hover cursor-pointer"
            onClick={handleLeaveServer}
          >
            Leave Server
          </div>
        </div>
      )}

      <CreateCategoryModal
        isOpen={newCategoryNameModal}
        onClose={() => setNewCategoryNameModal(false)}
        server={server}
        onCategoryCreated={fetchCategories}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        message={
          isOwnerLeaving
            ? 'You are the owner of this server. This action cannot be reversed, and all associated data will be deleted.'
            : 'Are you sure you want to leave this server?'
        }
        onConfirm={confirmLeaveServer}
        onCancel={() => setConfirmDialogOpen(false)}
      />

      {categories.map((category) => (
        <div key={category.id} className="mb-4">
          <div
            className="flex items-center justify-between px-4 cursor-pointer"
            onClick={() => toggleCategory(category.id)}
          >
            <div className="flex items-center">
              <span
                className={`mr-2 text-secondary dark:text-dark-text-secondary transition-transform ${
                  expandedCategories.has(category.id) ? 'rotate-0' : 'rotate-90'
                }`}
              >
                {/* Toggle Arrow */}
                {!expandedCategories.has(category.id) ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
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
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 9l6 6 6-6"
                    />
                  </svg>
                )}
              </span>
              <span className="font-semibold">{category.name}</span>
            </div>
          </div>

          {/* Channels under the category */}
          {expandedCategories.has(category.id) && (
            <div className="ml-4 mt-2">
              {/* Render channels for the category here */}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ServerDetail;
