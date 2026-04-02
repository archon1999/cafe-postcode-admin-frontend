import type {
  AdminHall,
  AdminPaginatedResponse,
  AdminPermission,
  AdminRole,
  AdminRolePayload,
  AdminUser,
  AdminUserPayload,
  AdminUsersQueryParams,
} from 'shared/api/admin-types';

export interface UsersRepository {
  getList(params: AdminUsersQueryParams): Promise<AdminPaginatedResponse<AdminUser>>;
  getById(id: string): Promise<AdminUser>;
  create(payload: AdminUserPayload): Promise<AdminUser>;
  update(id: string, payload: AdminUserPayload): Promise<AdminUser>;
  getEmployeeRoles(): Promise<AdminRole[]>;
  getEmployeeList(params: AdminUsersQueryParams): Promise<AdminPaginatedResponse<AdminUser>>;
  getEmployeeById(id: string): Promise<AdminUser>;
  createEmployee(payload: AdminUserPayload): Promise<AdminUser>;
  updateEmployee(id: string, payload: AdminUserPayload): Promise<AdminUser>;
  getRoles(): Promise<AdminRole[]>;
  getRoleById(id: string): Promise<AdminRole>;
  createRole(payload: AdminRolePayload): Promise<AdminRole>;
  updateRole(id: string, payload: AdminRolePayload): Promise<AdminRole>;
  deleteRole(id: string): Promise<void>;
  getPermissions(): Promise<AdminPermission[]>;
  getHalls(): Promise<AdminHall[]>;
}
