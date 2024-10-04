import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Modal from './Modal';

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
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get(`/category/${server.id}`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [server.id]);

  const handleCreateCategory = () => {
    console.log('Create new category');
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

  const handleDeleteCategory = (categoryId: string) => {
    setConfirmDeleteId(categoryId);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId) {
      try {
        await axiosInstance.delete(`/category/${confirmDeleteId}`);
        setCategories(categories.filter((cat) => cat.id !== confirmDeleteId));
      } catch (error) {
        console.error('Error deleting category:', error);
      } finally {
        setConfirmDeleteId(null);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-primary dark:bg-dark-primary rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Categories and Channels</h2>
        <button
          onClick={handleCreateCategory}
          className="text-white bg-button-primary hover:bg-button-hover rounded-lg px-4 py-2"
        >
          Create New Category
        </button>
      </div>
      <p>Manage categories and channels for your server here.</p>
      <div className="mt-4">
        {categories.length === 0 ? (
          <p>No categories found.</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className={`flex justify-between items-center p-4 bg-secondary dark:bg-dark-secondary rounded-lg mb-2 ${
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
                    className="w-full bg-secondary dark:bg-dark-secondary border-none border-gray-300 dark:border-dark-border p-2 rounded-lg"
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
                      onClick={() => handleDeleteCategory(category.id)}
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
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`Channels in ${selectedCategory?.name}`}
      >
        {/* Here, you would render channels related to the selected category */}
        <p>Channels will be displayed here.</p>
        {/* Add logic to display channels, edit, and delete channels */}
      </Modal>

      {/* Confirmation Dialog for Deletion */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Are you sure you want to delete this category?</p>
            <div className="mt-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="ml-2 bg-gray-300 px-4 py-2 rounded"
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
