import { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Server } from '../../types/server';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import CreateRoleModal from './CreateRoleModal';
import { Role } from '../../types/role';
import GeneralRole from './GeneralRole';
import PermissionRole from './PermissionRole';
import { Permission } from '../../types/permission';
import { useSnackbar } from '../Snackbar';
import Members from './Members';
import _ from 'lodash';
import { color } from 'framer-motion';

interface RolesProps {
  server: Server;
}

const Roles: React.FC<RolesProps> = ({ server }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [editingRoleId, setEditedRoleId] = useState<string | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] =
    useState<boolean>(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState<boolean>(false);
  const [roleId, setRoleId] = useState<string>('');
  const [confirmMessage, setConfirmMessage] = useState<React.ReactNode>(null);
  const [isConfirmModalButtonDisable, setIsConfirmModalButtonDisable] =
    useState<boolean>(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('General');
  const [selectedRoleData, setSelectedRoleData] = useState<Role | null>(null);
  const [editRoleData, setEditRoleData] = useState<Role | null>(
    selectedRoleData
  );
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    editRoleData?.permissions.map((e) => e.id) || []
  );
  const [showUpdateButton, setShowUpdateButton] = useState<Boolean>(false);
  const [members, setMembers] = useState<any>([]);
  const tabs = ['General', 'Permissions', 'Members'];
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server.id]);

  useEffect(() => {
    setEditRoleData(selectedRoleData);
    console.log(editRoleData, selectedRoleData);
  }, [selectedRoleData]);

  useEffect(() => {
    console.log(editRoleData);
    if (!_.isEqual(editRoleData, selectedRoleData)) {
      setShowUpdateButton(true);
    } else {
      setShowUpdateButton(false);
    }
    setSelectedPermissions(editRoleData?.permissions.map((e) => e.id) || []);
  }, [editRoleData]);

  useEffect(() => {
    if (activeTab === 'Members') {
      const fetchMembers = async () => {
        try {
          console.log(selectedRoleData);
          const response = await axiosInstance.get(
            `/roles/users/${selectedRoleData?.id}`
          );
          setMembers(response.data);
        } catch (error) {
          console.error('Error fetching members:', error);
          showSnackbar('Failed fetch members', 'error');
        }
      };

      fetchMembers();
    } else if (activeTab === 'Permissions') {
      const fetchPermissions = async () => {
        try {
          const response = await axiosInstance.get(`/permission`);
          setAllPermissions(response.data.permissions);
        } catch (error) {
          console.error('Error fetching permissions:', error);
          showSnackbar('Error fetching permissions', 'error');
        }
      };

      fetchPermissions();
    }
  }, [activeTab]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/roles/${server.id}`);
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching categories or channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEditRoleData = (key: keyof Role, value: any) => {
    if (key === 'permissions') {
      setEditRoleData((prevData) => {
        if (prevData) {
          // Check if the permission with the same id already exists
          const permissionExists = prevData.permissions.some(
            (perm) => perm.id === value.id
          );

          let updatedPermissions;

          if (permissionExists) {
            // Remove the permission if it exists
            updatedPermissions = prevData.permissions.filter(
              (perm) => perm.id !== value.id
            );
          } else {
            // Add the permission if it doesn't exist
            updatedPermissions = [...prevData.permissions, value];
          }

          console.log(updatedPermissions); // Log the updated permissions array

          return {
            ...prevData,
            permissions: updatedPermissions,
          };
        }
        return prevData; // If prevData is null, just return it
      });
    } else {
      // If the key is not "permissions", just update that specific key
      setEditRoleData((prevData) => {
        if (prevData) {
          return {
            ...prevData,
            [key]: value,
          };
        }
        return prevData; // If prevData is null, return it
      });
    }
  };

  const handleDeleteRole = async () => {
    try {
      setIsConfirmModalButtonDisable(true);
      const response = await axiosInstance.delete(
        `/roles/${server.id}/${selectedRoleData?.id}`
      );

      if (response.status === 200) {
        setRoles((prevRoles) =>
          prevRoles.filter((role) => role.id !== selectedRoleData?.id)
        );
        showSnackbar('Deleted Successfully!', 'success');
        setSelectedRoleData(null);
      }
      // Update the roles state
    } catch (error) {
      console.error('Error deleting role:', error);
      showSnackbar('Error Deleting Role', 'error');
    } finally {
      setIsConfirmModalButtonDisable(false);
    }
  };

  const handleDeleteModal = () => {
    setConfirmMessage(
      <>
        Are you sure, you want to{' '}
        <strong className="text-red-600">Delete</strong>
        {' the '}
        <>
          role <strong>{selectedRoleData?.name}</strong>
        </>
        ?
      </>
    );
    setIsConfirmDeleteModalOpen(true);
  };

  const confirmDeleteModal = async () => {
    handleDeleteRole();
    setIsConfirmDeleteModalOpen(false);
  };

  const confirmSaveModal = async () => {
    handleUpdateRoleDetails();
    setIsConfirmSaveModalOpen(false);
  };

  const setDefaultValues = () => {
    setIsConfirmSaveModalOpen(false);
    setIsConfirmDeleteModalOpen(false);
    setRoleId('');
    setConfirmMessage('');
  };

  const handleSelectedRole = (role: Role) => {
    console.log(role);
    setSelectedRoleId(role.id);
    setSelectedRoleData(role);
  };

  const handleUpdateRoleDetails = async () => {
    try {
      setIsConfirmModalButtonDisable(true);
      const response = await axiosInstance.patch(
        `/roles/${server.id}/${editRoleData?.id}`,
        {
          name: editRoleData?.name,
          description: editRoleData?.description,
          color: editRoleData?.color,
          permissions: editRoleData?.permissions.map((e) => e.id),
        }
      );

      if (response.status === 200) {
        setSelectedRoleData(editRoleData);
        showSnackbar('Updated Successfully!', 'success');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      showSnackbar('Error updating role', 'error');
    } finally {
      setIsConfirmModalButtonDisable(false);
    }
  };

  const handleUpdateModal = () => {
    setConfirmMessage(
      <>
        Are you sure, you want to{' '}
        <strong className="text-green-400">Save</strong>
        {' the '}
        <>
          role <strong>{`${editRoleData?.name} `} </strong>
        </>
        changes?
      </>
    );
    setIsConfirmSaveModalOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-bg-primary dark:bg-dark-primary rounded-lg p-6 flex flex-col grow h-0">
      <div className="flex justify-between items-center mb-4 grow-0">
        <h2 className="text-2xl font-semibold">Roles</h2>
        <button
          onClick={() => setIsRoleModalOpen(true)}
          className="text-white bg-button-primary hover:bg-button-hover rounded-lg px-4 py-2"
        >
          Create New Role
        </button>

        <CreateRoleModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          server={{
            id: server.id,
            name: server.name,
            server_picture_url: server.server_picture_url,
            invite_code: server.invite_code,
          }}
          onRoleCreated={fetchRoles}
          initialData={{
            roleId: '',
            roleName: '',
            roleDescription: '',
            color: '',
            permissions: [],
          }}
          type="create"
        />
      </div>
      <div className="flex gap-4 grow h-0">
        <div
          className={`${!selectedRoleData ? 'w-full' : 'w-1/4 bg-bg-tertiary dark:bg-dark-tertiary p-2 rounded-md h-full overflow-y-auto'}`}
        >
          {roles.map((role: Role) => (
            <div key={role.id} className="mb-4">
              <div
                onClick={() => handleSelectedRole(role)}
                className={`flex justify-between items-center flex-grow p-3 mb-2 rounded-md cursor-pointer '
                  ${selectedRoleData?.id === role.id ? 'bg-hover-bg dark:bg-dark-hover' : 'bg-bg-tertiary dark:bg-dark-tertiary'}
                `}
              >
                <div className="leading-tight">
                  <span>{role.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div
          className={`grow-1 p-4 rounded-md bg-bg-secondary dark:bg-dark-secondary h-full ${selectedRoleData ? 'w-full' : 'hidden'}`}
        >
          <div className="w-full relative h-full flex flex-col">
            {/* Pills Tab Buttons */}
            <div className="flex space-x-4 border-b border-b-1 border-gray-300 grow-0">
              {tabs.map((tab, index) => (
                <button
                  key={index}
                  className={`py-2 px-6 text-md font-medium transition duration-300 ease-in-out ${
                    activeTab === tab
                      ? 'border-b border-blue-400 border-b-4'
                      : ''
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <hr className="absolute" />

            {/* Tab Content */}
            <div className="p-4 grow h-0 overflow-y-auto">
              <div
                className={`${activeTab === 'General' ? 'block' : 'hidden'}`}
              >
                <GeneralRole
                  editRoleData={editRoleData}
                  handleChangeEditRoleData={handleChangeEditRoleData}
                  handleDeleteModal={handleDeleteModal}
                />
              </div>
              <div
                className={`${activeTab === 'Permissions' ? 'block' : 'hidden'} pt-6`}
              >
                <PermissionRole
                  selectedPermissions={selectedPermissions}
                  allPermissions={allPermissions}
                  handleChangeEditRoleData={handleChangeEditRoleData}
                />
              </div>
              <div
                className={`${activeTab === 'Members' ? 'block' : 'hidden'}`}
              >
                <Members server={server} members={members} />
              </div>
            </div>
            {showUpdateButton && activeTab !== 'Members' && (
              <div className="mt-4 flex justify-end">
                <button
                  className="bg-button-primary px-4 py-2 rounded-lg text-white"
                  onClick={handleUpdateModal}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isConfirmSaveModalOpen}
        message={confirmMessage}
        onConfirm={async () => await confirmSaveModal()}
        onCancel={() => setDefaultValues()}
        disable={isConfirmModalButtonDisable}
      />
      <ConfirmationDialog
        isOpen={isConfirmDeleteModalOpen}
        message={confirmMessage}
        onConfirm={async () => await confirmDeleteModal()}
        onCancel={() => setDefaultValues()}
        disable={isConfirmModalButtonDisable}
      />
    </div>
  );
};

export default Roles;
