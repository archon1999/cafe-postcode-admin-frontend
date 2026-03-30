import { apiClient } from 'shared/api';
import type { AdminLoginRequest } from 'shared/api/admin-types';

export const loginRequest = async (params: AdminLoginRequest) => {
  return await apiClient.loginAdmin(params);
};

export const getCurrentUserRequest = async () => {
  return await apiClient.getAdminMe();
};

export const logoutRequest = async () => {
  return await apiClient.logoutAdmin();
};
