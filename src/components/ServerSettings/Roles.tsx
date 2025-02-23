import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { useSnackbar } from '../Snackbar';
import CreateChannelModal from './CreateChannelModal';
import CreateCategoryModal from './CreateCategoryModal';
import { Channel } from '../../types/channel';
import { Category } from '../../types/category';
import { Server } from '../../types/server';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import CreateRoleModal from './CreateRoleModal';
import { Role } from '../../types/role';

interface RolesProps {
  server: Server;
}
interface RolesProps {
  roleName: string;
  roleDescription: string;
}

const Roles: React.FC<RolesProps> = ({ server }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [editingRoleId, setEditedRoleId] = useState<string | null>(null);
  const [editedRoleDescription, setEditedRoleDescription] =
    useState<string>('');
  const [editedRoleName, setEditedRoleName] = useState<string>('');
  const [newRoleNameModal, setNewRoleNameModal] = useState<boolean>(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isconfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [roleId, setRoleId] = useState<string>('');
  const [confirmMessage, setConfirmMessage] = useState<React.ReactNode>(null);
  const [isConfirmModalButtonDisable, setIsConfirmModalButtonDisable] =
    useState<boolean>(false);

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server.id]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/roles/${server.id}`);
      console.log('roles.tsx data', response.data);
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching categories or channels:', error);
    } finally {
      setLoading(false);
    }
  };

  // const editRole = async (categoryId: string, channelId: string) => {
  //   try {
  //     // Update the channel name in the backend
  //     await axiosInstance.patch(`/roles/${server.id}/${roleId}`, {
  //       name: editedRoleName,
  //       description: editedRoleDescription,
  //     });

  //     // Update the channels state
  //     setRoles((prevRoles) => {
  //       return {
  //         ...prevRoles,
  //       };
  //     });
  //   } catch (error: any) {
  //     console.error('Error updating role:', error);
  //     showSnackbar(error.response.data.detail[0].msg, 'error');
  //   } finally {
  //     setEditedRoleId(null);
  //   }
  // };

  const handleDeleteRole = async (roleId: string) => {
    try {
      setIsConfirmModalButtonDisable(true);
      await axiosInstance.delete(`/roles/${server.id}/${roleId}`);

      // Update the roles state
      setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
    } catch (error) {
      console.error('Error deleting role:', error);
    } finally {
      setIsConfirmModalButtonDisable(false);
    }
  };

  const toggleConfirmationDialog = (roleId: string, roleName: string) => {
    setIsConfirmModalOpen(true);
    setRoleId(roleId);
    setConfirmMessage(
      <>
        Are you sure, you want to{' '}
        <strong className="text-red-600">Delete</strong>
        {' the '}
        <>
          role <strong>{roleName}</strong>
        </>
        ?
      </>
    );
  };

  const confirmConfirmationModal = async () => {
    await handleDeleteRole(roleId);
    setRoleId('');
    setIsConfirmModalOpen(false);
  };

  const setDefaultValues = () => {
    setIsConfirmModalOpen(false);
    setRoleId('');
    setConfirmMessage('');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-bg-primary dark:bg-dark-primary rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Roles</h2>
        <button
          onClick={() => setNewRoleNameModal(true)}
          className="text-white bg-button-primary hover:bg-button-hover rounded-lg px-4 py-2"
        >
          Create New Role
        </button>

        <CreateRoleModal
          isOpen={newRoleNameModal}
          onClose={() => setNewRoleNameModal(false)}
          server={{
            id: server.id,
            name: server.name,
            server_picture_url: server.server_picture_url,
          }}
          onRoleCreated={fetchRoles}
        />
      </div>

      <div className="mt-4">
        {roles.length === 0 ? (
          <p>No roles founddd.</p>
        ) : (
          roles.map((role: any) => (
            <div key={role.id} className="mb-4">
              {
                <div
                  key={role.id}
                  className="flex justify-between items-center flex-grow p-2 mb-2 bg-bg-tertiary dark:bg-dark-tertiary rounded-md"
                >
                  {editingRoleId === role.id ? (
                    <>
                      <label className="block text-sm font-medium">
                        Role Name
                        <input
                          value={editedRoleName}
                          onChange={(e) => setEditedRoleName(e.target.value)}
                          className="w-full bg-bg-secondary border-none p-2 rounded-lg mt-1 outline-none"
                          placeholder="Enter role name"
                          autoFocus
                        />
                      </label>
                      <label className="block text-sm font-medium">
                        Role Description
                        <input
                          value={editedRoleDescription}
                          onChange={(e) =>
                            setEditedRoleDescription(e.target.value)
                          }
                          className="w-full bg-bg-secondary border-none p-2 rounded-lg mt-1 outline-none"
                          placeholder="Enter role description"
                        />
                      </label>
                      <div>
                        <button
                          // onClick={() => editRole(role.id)}
                          className={`mx-2 ${editedRoleName !== role.name || editedRoleDescription !== role.description ? 'text-green-500' : 'text-gray-500'}`}
                          disabled={
                            (editedRoleName === role.name &&
                              editedRoleDescription === role.description) ||
                            editedRoleName.trim() === ''
                          }
                        >
                          <i className="fas fa-lg fa-check" />
                        </button>
                        <button
                          onClick={() => setEditedRoleId(null)}
                          className="text-red-500 mx-2"
                        >
                          <i className="fas fa-lg fa-times" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <div className="leading-tight">
                          <span>{role.name}</span>
                          <br />
                          <span className="text-sm text-secondary dark:text-dark-text-secondary">
                            {role.description}
                          </span>
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            setEditedRoleId(role.id);
                            setEditedRoleName(role.name);
                            setEditedRoleDescription(role.description);
                          }}
                          className="text-blue-500 mx-2"
                        >
                          <i className="fas fa-edit" />
                        </button>
                        <button
                          onClick={() =>
                            toggleConfirmationDialog(role.id, role.name)
                          }
                          className="text-red-500 mx-2"
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              }
            </div>
          ))
        )}
      </div>

      <ConfirmationDialog
        isOpen={isconfirmModalOpen}
        message={confirmMessage}
        onConfirm={async () => await confirmConfirmationModal()}
        onCancel={() => setDefaultValues()}
        disable={isConfirmModalButtonDisable}
      />
    </div>
  );
};

export default Roles;
