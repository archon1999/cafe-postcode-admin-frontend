import type { AdminRolePayload, AdminUserPayload, AdminUsersQueryParams } from 'shared/api/admin-types';
import { apiClient } from 'shared/api/http/apiClient';

import type { UsersRepository } from '../../domain';

export const usersRepository: UsersRepository = {
  getList(params: AdminUsersQueryParams) {
    return apiClient.getAdminUsers(params);
  },

  getById(id: string) {
    return apiClient.getAdminUserById(id);
  },

  create(payload: AdminUserPayload) {
    return apiClient.createAdminUser(payload);
  },

  update(id: string, payload: AdminUserPayload) {
    return apiClient.updateAdminUser(id, payload);
  },

  getRoles() {
    return apiClient.getAdminRoles();
  },

  getRoleById(id: string) {
    return apiClient.getAdminRoleById(id);
  },

  createRole(payload: AdminRolePayload) {
    return apiClient.createAdminRole(payload);
  },

  updateRole(id: string, payload: AdminRolePayload) {
    return apiClient.updateAdminRole(id, payload);
  },

  deleteRole(id: string) {
    return apiClient.deleteAdminRole(id);
  },

  getPermissions() {
    return apiClient.getAdminPermissions();
  },

  getHalls() {
    return apiClient.getAdminHalls({ page: 1, pageSize: 200 }).then((response) => response.data);
  },
};
