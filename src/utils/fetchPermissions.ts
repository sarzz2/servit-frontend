import axiosInstance from './axiosInstance';

export const fetchPermissions = async (serverId: string | undefined) => {
  try {
    const response = await axiosInstance.get(
      `/servers/${serverId}/roles_permissions`
    );
    return response.data;
  } catch (error: any) {
    console.error(error);
    throw new Error('Error fetching permissions: ' + error.message);
  }
};
