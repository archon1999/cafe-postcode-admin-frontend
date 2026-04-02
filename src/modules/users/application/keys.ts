import { createKeyFactory } from 'shared/api';

const usersBaseKeys = createKeyFactory('users');
const employeesKeys = createKeyFactory('employees');
const permissionsKeys = createKeyFactory('users', 'permissions');
const hallsKeys = createKeyFactory('users', 'halls');
const rolesKeys = (surface: 'user' | 'employee' = 'user') => createKeyFactory('users', 'roles', surface);

export const usersKeys = {
  all: usersBaseKeys.all,
  list: usersBaseKeys.list,
  detail: usersBaseKeys.detail,
  employees: employeesKeys.all,
  employeeList: employeesKeys.list,
  employeeDetail: employeesKeys.detail,
  roles: (surface: 'user' | 'employee' = 'user') => rolesKeys(surface).all,
  rolesList: (params: Record<string, unknown>) => rolesKeys().list(params),
  roleDetail: (id: string) => rolesKeys().detail(id),
  permissions: () => permissionsKeys.all,
  permissionsList: permissionsKeys.list,
  halls: () => hallsKeys.all,
} as const;
