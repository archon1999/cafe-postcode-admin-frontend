export const USER_EMPLOYMENT_STATUS_VALUES = ['active', 'inactive', 'archived'] as const;

export const USER_ROLE_TYPE_VALUES = ['system', 'custom'] as const;

export const USER_PERMISSION_SCOPE_BADGE_CONFIG = {
  admin: { color: 'primary', icon: 'solar:key-bold-duotone' },
  pos: { color: 'warning', icon: 'solar:shop-2-bold-duotone' },
  dashboard: { color: 'success', icon: 'solar:chart-square-bold-duotone' },
} as const;

export const USER_PERMISSION_ACTION_BADGE_CONFIG = {
  list: { color: 'info', icon: 'solar:list-bold' },
  view: { color: 'success', icon: 'solar:eye-bold' },
  manage: { color: 'primary', icon: 'solar:key-bold-duotone' },
  create: { color: 'secondary', icon: 'solar:add-circle-bold' },
  update: { color: 'warning', icon: 'solar:pen-bold' },
  delete: { color: 'error', icon: 'solar:trash-bin-trash-bold' },
  activate: { color: 'success', icon: 'solar:play-circle-bold' },
  deactivate: { color: 'error', icon: 'solar:lock-keyhole-bold' },
  reset_password: { color: 'secondary', icon: 'solar:refresh-circle-bold-duotone' },
  open: { color: 'success', icon: 'solar:play-bold' },
  close: { color: 'error', icon: 'solar:lock-keyhole-bold' },
  refund: { color: 'warning', icon: 'solar:refresh-bold' },
  reprint: { color: 'info', icon: 'solar:refresh-circle-bold-duotone' },
} as const;
