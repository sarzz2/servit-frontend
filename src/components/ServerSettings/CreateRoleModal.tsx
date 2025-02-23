import { useEffect, useState } from 'react';
import { Server } from '../../types/server';
import axiosInstance from '../../utils/axiosInstance';
import { useSnackbar } from '../Snackbar';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server;
  onRoleCreated: () => void;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  server,
  onRoleCreated,
}) => {
  const [roleName, setRoleName] = useState<string>('');
  const [roleDescription, setRoleDescription] = useState<string>('');
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (roleName && roleDescription) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [roleName, roleDescription]);

  const handleSubmit = () => {
    axiosInstance
      .post(`/roles/${server.id}`, {
        name: roleName,
        description: roleDescription,
        color: '#ffffff',
        permissions: ['2051cce6-da91-4065-af73-5f72f43dcf8b'],
      })
      .then((response) => {
        setRoleName('');
        showSnackbar('Category created successfully!', 'success');
        onRoleCreated();
        onClose();
      })
      .catch((error) => {
        console.error('Error creating category:', error);
        showSnackbar(error.response.data.detail[0].msg, 'error');
      });
  };

  const handleRolePermissions = (
    e: React.ChangeEvent<HTMLInputElement>,
    permissionId: string
  ) => {
    if (e.target.checked) {
      setRolePermissions((prevRolePermission) => [
        ...prevRolePermission,
        permissionId,
      ]);
    } else {
      setRolePermissions((prevRolePermissions) =>
        prevRolePermissions.filter(
          (rolePermission) => rolePermission !== permissionId
        )
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-50">
      <div className="bg-bg-primary dark:bg-dark-primary p-6 rounded-lg shadow-lg w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Create Role</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-white hover:text-gray-900 dark:hover:text-gray-400"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Role Name</label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Enter role name"
            className="w-full p-2 bg-bg-secondary dark:bg-dark-secondary outline-none rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-2">Role Description</label>
          <input
            type="text"
            value={roleDescription}
            onChange={(e) => setRoleDescription(e.target.value)}
            placeholder="Enter role description"
            className="w-full p-2 bg-bg-secondary dark:bg-dark-secondary outline-none rounded-lg"
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Permissions</label>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center">
              <label
                className="block font-medium mb-2"
                htmlFor={`permission-asda`}
              >
                All
              </label>
              <input
                id={`permission-asda`}
                type="checkbox"
                value={'asda'}
                onChange={(e) => {
                  handleRolePermissions(e, 'asda');
                }}
                className="w-full p-2 bg-bg-secondary dark:bg-dark-secondary outline-none rounded-lg"
              />
            </div>
            <div>
              <label
                className="block font-medium mb-2"
                htmlFor={`permission-22`}
              >
                Owner
              </label>
              <input
                id={`permission-22`}
                type="checkbox"
                value={'22'}
                onChange={(e) => {
                  handleRolePermissions(e, '22');
                }}
                className="w-full p-2 bg-bg-secondary dark:bg-dark-secondary outline-none rounded-lg"
              />
            </div>
          </div>
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
            className="bg-button-primary text-white hover:bg-button-hover px-4 py-2 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={isButtonDisabled}
          >
            Create Category
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoleModal;
