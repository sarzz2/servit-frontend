import React, { useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useSnackbar } from '../Snackbar';
import { Server } from '../../types/server';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server;
  onCategoryCreated: () => void;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  server,
  onCategoryCreated,
}) => {
  const [categoryName, setCategoryName] = useState('');
  const { showSnackbar } = useSnackbar();

  const handleSubmit = () => {
    axiosInstance
      .post(`/category/${server.id}`, { name: categoryName })
      .then((response) => {
        setCategoryName('');
        showSnackbar('Category created successfully!', 'success');
        onCategoryCreated();
        onClose();
      })
      .catch((error) => {
        console.error('Error creating category:', error);
        showSnackbar(error.response.data.detail[0].msg, 'error');
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-bg-primary dark:bg-dark-primary p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create Category</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-white hover:text-gray-900 dark:hover:text-gray-400"
          >
            &times;
          </button>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Category Name</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="New Category"
            className="w-full p-2 bg-bg-secondary dark:bg-dark-secondary outline-none rounded-lg"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="dark:bg-dark-hover px-4 py-2 rounded-lg mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-button-primary hover:bg-button-hover px-4 py-2 rounded-lg"
          >
            Create Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCategoryModal;
