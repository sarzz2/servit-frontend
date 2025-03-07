import { Permission } from "./permission";

export interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: Permission[];
}

export interface RoleModalData {
  roleId: string;
  roleName: string;
  roleDescription: string;
  color: string;
  permissions: string[];
}
