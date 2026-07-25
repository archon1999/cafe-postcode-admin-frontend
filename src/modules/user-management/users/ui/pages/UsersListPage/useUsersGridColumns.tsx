import Chip from '@mui/material/Chip';
import type { GridColDef } from '@mui/x-data-grid';
import { useCallback, useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminUser } from 'shared/api/admin-types';
import { CopyableTextCell } from 'shared/ui/CopyableTextCell';
import { CustomGridActionsCellItem, withDetailLink } from 'shared/ui/CustomDataGrid';
import { Iconify } from 'shared/ui/Iconify';

import {
  useArchiveEmployeeMutation,
  useArchiveUserMutation,
  useToggleEmployeeActiveMutation,
  useToggleUserActiveMutation,
} from '../../../application';
import { roleRequiresEmployeeCredentials, type UserManagementSurface } from '../../../domain';

import { getUsersGridActionKeys } from './users-grid.actions';

function getEmploymentStatusChipColor(status?: AdminUser['employmentStatus']) {
  if (status === 'inactive') return 'warning';
  if (status === 'archived') return 'default';
  return 'success';
}

export function useUsersGridColumns(
  surface: UserManagementSurface,
  canEditEmployee: boolean,
  onChangePin: (employeeId: string) => void,
) {
  const { t } = useTranslate('users');
  const { t: tCommon } = useTranslate('common');
  const toggleEmployeeStatusMutation = useToggleEmployeeActiveMutation();
  const toggleUserStatusMutation = useToggleUserActiveMutation();
  const toggleStatusMutation = surface === 'employee' ? toggleEmployeeStatusMutation : toggleUserStatusMutation;
  const archiveEmployeeMutation = useArchiveEmployeeMutation();
  const archiveUserMutation = useArchiveUserMutation();
  const archiveMutation = surface === 'employee' ? archiveEmployeeMutation : archiveUserMutation;

  const viewHref = useCallback(
    (id: string) => (surface === 'employee' ? RouterPathHelper.employeeView(id) : RouterPathHelper.userView(id)),
    [surface],
  );
  const editHref = useCallback(
    (id: string) => (surface === 'employee' ? RouterPathHelper.employeeEdit(id) : RouterPathHelper.userEdit(id)),
    [surface],
  );

  const columns = useMemo<GridColDef<AdminUser>[]>(() => {
    const nextColumns: GridColDef<AdminUser>[] = [];
    if (surface !== 'employee') {
      nextColumns.push(
        withDetailLink<AdminUser>(
          { field: 'username', headerName: t('fields.username'), minWidth: 180, flex: 0.95 },
          (row) => viewHref(row.id),
        ),
      );
    }
    if (surface === 'employee') {
      nextColumns.push(
        withDetailLink<AdminUser>(
          {
            field: 'fullName',
            headerName: t('fields.fullName'),
            minWidth: 220,
            flex: 1.2,
            renderCell: ({ row }) => <CopyableTextCell value={row.fullName} />,
          },
          (row) => viewHref(row.id),
        ),
        {
          field: 'username',
          headerName: t('fields.username'),
          minWidth: 180,
          flex: 0.9,
          valueGetter: (_, row) => (roleRequiresEmployeeCredentials(row.role?.code) ? row.username : '-'),
          renderCell: ({ row }) => (
            <CopyableTextCell value={roleRequiresEmployeeCredentials(row.role?.code) ? row.username : null} />
          ),
        },
      );
    } else {
      nextColumns.push({ field: 'fullName', headerName: t('fields.fullName'), minWidth: 220, flex: 1.2 });
    }

    nextColumns.push(
      {
        field: 'role',
        headerName: t('fields.role'),
        minWidth: 190,
        flex: 1,
        valueGetter: (_, row) => row.role?.name ?? t('labels.withoutRole'),
      },
      {
        field: 'employmentStatus',
        headerName: t('fields.status'),
        minWidth: 150,
        sortable: false,
        renderCell: ({ row }) => {
          const statusValue = row.employmentStatus ?? (row.isActive ? 'active' : 'inactive');
          return (
            <Chip
              size="small"
              label={t(`status.${statusValue}`)}
              color={getEmploymentStatusChipColor(statusValue)}
              variant="soft"
            />
          );
        },
      },
      {
        field: 'phone',
        headerName: t('fields.phone'),
        minWidth: 160,
        flex: 0.9,
        valueGetter: (_, row) => row.phone || '-',
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: tCommon('actions.title'),
        minWidth: 90,
        flex: 0,
        getActions: (params) => {
          const actionKeys = getUsersGridActionKeys({
            surface,
            canEditEmployee,
            canChangePin: !roleRequiresEmployeeCredentials(params.row.role?.code),
            employmentStatus: params.row.employmentStatus,
            isActive: params.row.isActive,
          });
          return actionKeys.map((actionKey) => {
            if (actionKey === 'view') {
              return (
                <CustomGridActionsCellItem
                  actionKind="view"
                  key="view"
                  label={tCommon('labels.details')}
                  icon={<Iconify icon="solar:eye-bold" />}
                  href={viewHref(params.row.id)}
                />
              );
            }
            if (actionKey === 'edit') {
              return (
                <CustomGridActionsCellItem
                  actionKind="edit"
                  key="edit"
                  label={t('actions.edit')}
                  icon={<Iconify icon="solar:pen-bold" />}
                  href={editHref(params.row.id)}
                />
              );
            }
            if (actionKey === 'change-pin') {
              return (
                <CustomGridActionsCellItem
                  actionKind="edit"
                  key="change-pin"
                  label={t('actions.changePin')}
                  icon={<Iconify icon="solar:key-bold" />}
                  onClick={() => onChangePin(params.row.id)}
                />
              );
            }
            if (actionKey === 'activate' || actionKey === 'deactivate') {
              const nextActive = actionKey === 'activate';
              return (
                <CustomGridActionsCellItem
                  actionKind="edit"
                  key={actionKey}
                  label={t(`actions.${actionKey}`)}
                  icon={<Iconify icon={nextActive ? 'solar:play-circle-bold' : 'solar:pause-circle-bold'} />}
                  onClick={() => toggleStatusMutation.mutate({ user: params.row, isActive: nextActive })}
                />
              );
            }
            return (
              <CustomGridActionsCellItem
                actionKind="delete"
                key="archive"
                label={t('actions.archive')}
                icon={<Iconify icon="solar:archive-bold" />}
                onClick={() => archiveMutation.mutate(params.row)}
              />
            );
          });
        },
      },
    );
    return nextColumns;
  }, [archiveMutation, canEditEmployee, editHref, onChangePin, surface, t, tCommon, toggleStatusMutation, viewHref]);

  return { columns, viewHref };
}
