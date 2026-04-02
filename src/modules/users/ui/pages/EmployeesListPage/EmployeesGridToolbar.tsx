import {
  DEFAULT_USERS_GRID_FILTERS,
  type UsersGridFilters,
  UsersGridToolbar,
  type UsersGridToolbarProps,
} from '../UsersListPage/UsersGridToolbar';

export type EmployeesGridFilters = UsersGridFilters;

export const DEFAULT_EMPLOYEES_GRID_FILTERS = DEFAULT_USERS_GRID_FILTERS;

type EmployeesGridToolbarProps = Omit<UsersGridToolbarProps, 'surface'>;

export function EmployeesGridToolbar(props: EmployeesGridToolbarProps) {
  return <UsersGridToolbar {...props} surface="employee" />;
}
