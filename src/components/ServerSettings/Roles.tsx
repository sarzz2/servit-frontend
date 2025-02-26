import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { Server } from '../../types/server';
import ConfirmationDialog from '../Common/ConfirmationDialog';
import CreateRoleModal from './CreateRoleModal';
import { Role } from '../../types/role';

interface RolesProps {
  server: Server;
}

const Roles: React.FC<RolesProps> = ({ server }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [editingRoleId, setEditedRoleId] = useState<string | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);
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
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching categories or channels:', error);
    } finally {
      setLoading(false);
    }
  };

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

      <div className="mt-4">
        {roles.length === 0 ? (
          <p>No roles found.</p>
        ) : (
          roles.map((role: Role) => (
            <div key={role.id} className="mb-4">
              {editingRoleId === role.id ? (
                <CreateRoleModal
                  isOpen={isRoleModalOpen}
                  onClose={() => {
                    setIsRoleModalOpen(false);
                    setEditedRoleId('');
                  }}
                  server={{
                    id: server.id,
                    name: server.name,
                    server_picture_url: server.server_picture_url,
                    invite_code: server.invite_code,
                  }}
                  onRoleCreated={fetchRoles}
                  initialData={{
                    roleId: editingRoleId,
                    roleName: role.name,
                    roleDescription: role.description,
                    color: role.color,
                    permissions: role.permissions.map(
                      (permission) => permission.id
                    ),
                  }}
                  type="update"
                />
              ) : (
                <>
                  <div className="flex justify-between items-center flex-grow p-2 mb-2 bg-bg-tertiary dark:bg-dark-tertiary rounded-md">
                    <div className="leading-tight">
                      <span>{role.name}</span>
                      <br />
                      <span className="text-sm text-secondary dark:text-dark-text-secondary">
                        {role.description}
                      </span>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setEditedRoleId(role.id);
                          setIsRoleModalOpen(true);
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
                  </div>
                </>
              )}
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
