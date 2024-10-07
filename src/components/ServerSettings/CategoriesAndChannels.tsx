import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import ChannelModal from './ChannelModal';
import CreateCategoryModal from './CreateCategoryModal';
import { useSnackbar } from '../Snackbar';

interface CategoriesAndChannelsProps {
  server: any;
}

const CategoriesAndChannels: React.FC<CategoriesAndChannelsProps> = ({
  server,
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editedCategoryName, setEditedCategoryName] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newCategoryNameModal, setNewCategoryNameModal] =
    useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<any>(null);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server.id]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/category/${server.id}`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (
    event: React.MouseEvent,
    categoryId: string,
    name: string
  ) => {
    event.stopPropagation();
    setEditingCategoryId(categoryId);
    setEditedCategoryName(name);
  };

  const saveCategory = async (categoryId: string) => {
    try {
      await axiosInstance.patch(`/category/${server.id}/${categoryId}`, {
        name: editedCategoryName,
      }); // Update the category
      setCategories(
        categories.map((cat) =>
          cat.id === categoryId ? { ...cat, name: editedCategoryName } : cat
        )
      );
    } catch (error) {
      console.error('Error updating category:', error);
    } finally {
      setEditingCategoryId(null);
    }
  };

  const cancelEdit = () => {
    setEditingCategoryId(null);
  };

  const handleDeleteCategory = (event: React.MouseEvent, category: any) => {
    event.stopPropagation();
    setConfirmDeleteCategory(category);
  };

  const confirmDelete = async () => {
    if (confirmDeleteCategory) {
      try {
        await axiosInstance.delete(
          `/category/${server.id}/${confirmDeleteCategory.id}`
        );
        setConfirmDeleteCategory(null);
        showSnackbar('Category deleted successfully!', 'success');
        setCategories(
          categories.filter((cat) => cat.id !== confirmDeleteCategory.id)
        );
      } catch (error) {
        showSnackbar('Error deleting category! Please try again', 'error');
        console.error('Error deleting category:', error);
      }
    }
  };

  const openModal = (category: any) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleCategoryCreated = () => {
    fetchCategories();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-bg-primary dark:bg-dark-primary rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Categories and Channels</h2>
        <button
          onClick={() => setNewCategoryNameModal(true)}
          className="text-white bg-button-primary hover:bg-button-hover rounded-lg px-4 py-2"
        >
          Create New Category
        </button>

        <CreateCategoryModal
          isOpen={newCategoryNameModal}
          onClose={() => setNewCategoryNameModal(false)}
          server={server}
          onCategoryCreated={handleCategoryCreated}
        />
      </div>
      <p>Manage categories and channels for your server here.</p>
      <div className="mt-4">
        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className={`flex justify-between items-center p-4 bg-bg-secondary dark:bg-dark-secondary rounded-lg mb-2 ${
                editingCategoryId === category.id ? '' : 'cursor-pointer'
              }`}
              onClick={() => {
                if (!editingCategoryId) openModal(category);
              }}
            >
              {editingCategoryId === category.id ? (
                <div className="flex flex-grow items-center">
                  <input
                    type="text"
                    value={editedCategoryName}
                    onChange={(e) => setEditedCategoryName(e.target.value)}
                    className="w-full bg-bg-secondary dark:bg-dark-secondary border-none border-gray-300 dark:border-dark-border p-2 rounded-lg"
                    placeholder="Enter category name"
                    autoFocus
                  />
                </div>
              ) : (
                <span className="font-medium">{category.name}</span>
              )}

              <div className="flex items-center">
                {editingCategoryId === category.id ? (
                  <>
                    <button
                      onClick={() => saveCategory(category.id)}
                      className="text-green-500 hover:text-green-700 mx-1"
                    >
                      <span className="material-icons">Update</span>
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-red-500 hover:text-red-700 mx-1"
                    >
                      <span className="material-icons">Close</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(event) =>
                        handleEditCategory(event, category.id, category.name)
                      }
                      className="text-blue-500 hover:underline mx-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(event) => handleDeleteCategory(event, category)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Modal for Channels */}
      <ChannelModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`Channels in ${selectedCategory?.name}`}
      ></ChannelModal>

      {/* Confirmation Dialog for Deletion */}
      {confirmDeleteCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-bg-primary dark:bg-dark-primary rounded-lg p-6 z-50">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>
              Are you sure you want to delete{' '}
              <b>{confirmDeleteCategory?.name} </b>
              category?
            </p>
            <div className="mt-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white hover:bg-red-700 px-4 py-2 rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDeleteCategory(null)}
                className="ml-2 bg-gray-400 hover:bg-gray-600 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesAndChannels;
