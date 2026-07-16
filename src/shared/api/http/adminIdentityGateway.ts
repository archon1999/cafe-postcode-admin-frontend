import type {
  AdminCollectionResponse,
  AdminLoginRequest,
  AdminLoginResponse,
  AdminPaginatedResponse,
  AdminPermission,
  AdminPermissionsQueryParams,
  AdminRestaurant,
  AdminRole,
  AdminRolePayload,
  AdminRolesQueryParams,
  AdminSessionUser,
  AdminUser,
  AdminUserPayload,
  AdminUsersQueryParams,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

function extractCollectionData<T>(payload: AdminCollectionResponse<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
}

function getUsers(path: string, params: AdminUsersQueryParams) {
  return instance
    .get<AdminPaginatedResponse<AdminUser>>(path, {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
        role_id_in: params.roleIdIn,
        employment_status_in: params.employmentStatusIn,
        ordering: params.ordering,
      },
    })
    .then((response) => response.data);
}

export const adminIdentityGateway = {
  loginAdmin(payload: AdminLoginRequest) {
    return instance.post<AdminLoginResponse>('/api/v1/admin/auth/login/', payload).then((response) => response.data);
  },

  logoutAdmin() {
    return instance.post<void>('/api/v1/admin/auth/logout/').then((response) => response.data);
  },

  getAdminMe() {
    return instance.get<AdminSessionUser>('/api/v1/admin/auth/me/').then((response) => response.data);
  },

  getAdminMyRestaurant() {
    return instance.get<AdminRestaurant>('/api/v1/admin/restaurants/my-restaurant/').then((response) => response.data);
  },

  getAdminUsers(params: AdminUsersQueryParams) {
    return getUsers('/api/v1/admin/users/', params);
  },

  getAdminUserById(id: string) {
    return instance.get<AdminUser>(`/api/v1/admin/users/${id}/`).then((response) => response.data);
  },

  createAdminUser(payload: AdminUserPayload) {
    return instance.post<AdminUser>('/api/v1/admin/users/', payload).then((response) => response.data);
  },

  updateAdminUser(id: string, payload: AdminUserPayload) {
    return instance.put<AdminUser>(`/api/v1/admin/users/${id}/`, payload).then((response) => response.data);
  },

  getAdminEmployees(params: AdminUsersQueryParams) {
    return getUsers('/api/v1/admin/employees/', params);
  },

  getAdminEmployeeById(id: string) {
    return instance.get<AdminUser>(`/api/v1/admin/employees/${id}/`).then((response) => response.data);
  },

  createAdminEmployee(payload: AdminUserPayload) {
    return instance.post<AdminUser>('/api/v1/admin/employees/', payload).then((response) => response.data);
  },

  updateAdminEmployee(id: string, payload: AdminUserPayload) {
    return instance.put<AdminUser>(`/api/v1/admin/employees/${id}/`, payload).then((response) => response.data);
  },

  getAdminRoles() {
    return instance
      .get<AdminCollectionResponse<AdminRole> | AdminRole[]>('/api/v1/admin/roles/', { params: { pageSize: 100 } })
      .then((response) => extractCollectionData(response.data));
  },

  getAdminEmployeeRoles() {
    return instance
      .get<AdminCollectionResponse<AdminRole> | AdminRole[]>('/api/v1/admin/employees/roles/', {
        params: { pageSize: 100 },
      })
      .then((response) => extractCollectionData(response.data));
  },

  getAdminRolesPage(params: AdminRolesQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminRole>>('/api/v1/admin/roles/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          type_in: params.typeIn,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminRoleById(id: string) {
    return instance.get<AdminRole>(`/api/v1/admin/roles/${id}/`).then((response) => response.data);
  },

  createAdminRole(payload: AdminRolePayload) {
    return instance.post<AdminRole>('/api/v1/admin/roles/', payload).then((response) => response.data);
  },

  updateAdminRole(id: string, payload: AdminRolePayload) {
    return instance.put<AdminRole>(`/api/v1/admin/roles/${id}/`, payload).then((response) => response.data);
  },

  deleteAdminRole(id: string) {
    return instance.delete<void>(`/api/v1/admin/roles/${id}/`).then((response) => response.data);
  },

  getAdminPermissions() {
    return instance
      .get<AdminCollectionResponse<AdminPermission> | AdminPermission[]>('/api/v1/admin/permissions/options/')
      .then((response) => extractCollectionData(response.data));
  },

  getAdminPermissionsPage(params: AdminPermissionsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminPermission>>('/api/v1/admin/permissions/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          scope_in: params.scopeIn,
          action_in: params.actionIn,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },
};
