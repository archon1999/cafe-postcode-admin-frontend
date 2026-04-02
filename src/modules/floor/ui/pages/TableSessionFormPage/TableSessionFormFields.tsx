import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';

import { RHFSelect, RHFTextField } from 'shared/ui/HookForm';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';

import { getTableSessionStatusTranslationKey } from '../../lib/presenters';

import type { Values } from './TableSessionFormPage';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type Option = {
  id: string;
  name: string;
};

type UserOption = {
  id: string;
  fullName?: string | null;
  username?: string | null;
};

type TableSessionFormFieldsProps = {
  halls: Option[];
  isHallsLoading: boolean;
  isTablesLoading: boolean;
  isUsersLoading: boolean;
  statuses: readonly Values['status'][];
  t: TranslateFn;
  tCommon: TranslateFn;
  tables: Option[];
  users: UserOption[];
};

export const TableSessionFormFields = ({
  halls,
  isHallsLoading,
  isTablesLoading,
  isUsersLoading,
  statuses,
  t,
  tCommon,
  tables,
  users,
}: TableSessionFormFieldsProps) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
    <RHFSelect<Values> name="hall" label={t('fields.hall')} helperText={isHallsLoading ? tCommon('labels.loading') : undefined}>
      {halls.map((hall) => (
        <MenuItem key={hall.id} value={hall.id}>
          {formatHallDisplayName(hall.name)}
        </MenuItem>
      ))}
    </RHFSelect>
    <RHFSelect<Values> name="table" label={t('fields.table')} helperText={isTablesLoading ? tCommon('labels.loading') : undefined}>
      {tables.map((table) => (
        <MenuItem key={table.id} value={table.id}>
          {table.name}
        </MenuItem>
      ))}
    </RHFSelect>
    <RHFSelect<Values>
      name="openedBy"
      label={t('fields.openedBy')}
      helperText={isUsersLoading ? tCommon('labels.loading') : undefined}>
      <MenuItem value="">{t('labels.notSelected')}</MenuItem>
      {users.map((user) => (
        <MenuItem key={user.id} value={user.id}>
          {user.fullName || user.username}
        </MenuItem>
      ))}
    </RHFSelect>
    <RHFSelect<Values>
      name="assignedWaiter"
      label={t('fields.assignedWaiter')}
      helperText={isUsersLoading ? tCommon('labels.loading') : undefined}>
      <MenuItem value="">{t('labels.notSelected')}</MenuItem>
      {users.map((user) => (
        <MenuItem key={user.id} value={user.id}>
          {user.fullName || user.username}
        </MenuItem>
      ))}
    </RHFSelect>
    <RHFTextField<Values> name="guestCount" label={t('fields.guestCount')} type="number" />
    <RHFSelect<Values> name="status" label={t('fields.status')}>
      {statuses.map((status) => (
        <MenuItem key={status} value={status}>
          {t(getTableSessionStatusTranslationKey(status))}
        </MenuItem>
      ))}
    </RHFSelect>
    <RHFTextField<Values> name="note" label={t('fields.note')} multiline rows={4} />
  </Box>
);
