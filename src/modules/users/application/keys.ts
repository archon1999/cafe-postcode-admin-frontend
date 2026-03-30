export const usersKeys = {
  all: ['users'] as const,
  list: (params: Record<string, unknown>) => [...usersKeys.all, 'list', params] as const,
  detail: (id: string) => [...usersKeys.all, 'detail', id] as const,
  roles: () => [...usersKeys.all, 'roles'] as const,
  rolesList: (params: Record<string, unknown>) => [...usersKeys.roles(), 'list', params] as const,
  roleDetail: (id: string) => [...usersKeys.roles(), 'detail', id] as const,
  permissions: () => [...usersKeys.all, 'permissions'] as const,
  permissionsList: (params: Record<string, unknown>) => [...usersKeys.permissions(), 'list', params] as const,
  halls: () => [...usersKeys.all, 'halls'] as const,
};
