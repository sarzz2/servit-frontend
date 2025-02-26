import { useEffect, useRef, useState } from 'react';
import { Server } from '../../types/server';
import axiosInstance from '../../utils/axiosInstance';
import { useSnackbar } from '../Snackbar';
import { RoleModalData } from '../../types/role';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: Server;
  onRoleCreated: () => void;
  initialData: RoleModalData;
  type: string;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({
  isOpen,
  onClose,
  server,
  onRoleCreated,
  initialData,
  type,
}) => {
  const [roleName, setRoleName] = useState<string>(initialData.roleName || '');
  const [roleDescription, setRoleDescription] = useState<string>(
    initialData.roleDescription || ''
  );
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    initialData.permissions || []
  );
  const [selectedColor, setSelectedColor] = useState(
    initialData.color || '#000000'
  );
  const { showSnackbar } = useSnackbar();
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (roleName && roleDescription && selectedPermissions.length > 0) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }, [roleName, roleDescription, selectedPermissions]);

  useEffect(() => {
    axiosInstance
      .get('/permission')
      .then((response) => {
        setRolePermissions(response.data.permissions);
      })
      .catch((error) => {
        console.error('Error creating category:', error);
        showSnackbar(error.response.data.detail[0].msg, 'error');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    const filteredPermissions = selectedPermissions.filter(
      (permission) => permission !== null
    );

    const roleData = {
      name: roleName,
      description: roleDescription,
      color: selectedColor,
      permissions: filteredPermissions,
    };

    const request =
      type === 'create'
        ? axiosInstance.post(`/roles/${server.id}`, roleData)
        : axiosInstance.patch(
            `/roles/${server.id}/${initialData.roleId}`,
            roleData
          );

    request
      .then((response) => {
        setRoleName('');
        setRoleDescription('');
        setRolePermissions([]);
        showSnackbar(
          `Role ${type === 'create' ? 'created' : 'updated'} successfully!`,
          'success'
        );
        onRoleCreated();
        onClose();
      })
      .catch((error) => {
        console.error(
          `Error ${type === 'create' ? 'creating' : 'updating'} role:`,
          error
        );
        showSnackbar(error.response.data.detail[0].msg, 'error');
      });
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(() => {
      if (selectedPermissions.includes(permissionId)) {
        return selectedPermissions.filter((id) => id !== permissionId);
      } else {
        return [...selectedPermissions, permissionId];
      }
    });
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(event.target.value);
  };

  const handleCircleClick = () => {
    colorInputRef.current!.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 z-50">
      <div className="bg-bg-primary dark:bg-dark-primary p-6 rounded-lg shadow-lg w-full max-w-2xl h-full max-h-100 overflow-auto scroll-m-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {' '}
            {type === 'create' ? 'Create ' : 'Update '}
            Role
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-white hover:text-gray-900 dark:hover:text-gray-400"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="flex gap-6 mb-4">
          <div className="mb-4 grow">
            <label className="block font-medium mb-2">Role Name</label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Enter role name"
              className="w-full p-2 bg-bg-secondary dark:bg-dark-secondary outline-none rounded-lg"
            />
          </div>
          <div className="mb-4 grow">
            <label className="block font-medium mb-2">Role Description</label>
            <input
              type="text"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
              placeholder="Enter role description"
              className="w-full p-2 bg-bg-secondary dark:bg-dark-secondary outline-none rounded-lg"
            />
          </div>
        </div>
        <div className="flex gap-6 items-center mb-6">
          <label className="block font-medium mb-2">Choose a color</label>
          <div className="relative w-10 h-10">
            {/* Hidden color input */}
            <input
              type="color"
              ref={colorInputRef}
              defaultValue={selectedColor}
              onChange={handleColorChange}
              className="sr-only"
            />
            {/* Custom circle */}
            <div
              onClick={handleCircleClick}
              style={{ backgroundColor: selectedColor }}
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300 dark:border-gray-600"
            ></div>
          </div>
        </div>
        <div>
          <label className="block font-medium my-2">Permissions</label>
          <div className="grid grid-cols-2 gap-x-10 gap-y-2 pb-6 pt-3">
            {rolePermissions &&
              rolePermissions.map((permission) => (
                <div className="flex justify-between items-center mb-4">
                  <span className="text-md">
                    {permission.name
                      .split('_')
                      .map(
                        (word: string) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(' ')}
                  </span>
                  <label className="relative inline-block w-10 h-6">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-gray-300 rounded-full peer-checked:bg-green-500 transition-colors duration-300"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-4"></div>
                  </label>
                </div>
              ))}
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
            {type === 'create' ? 'Create' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoleModal;
