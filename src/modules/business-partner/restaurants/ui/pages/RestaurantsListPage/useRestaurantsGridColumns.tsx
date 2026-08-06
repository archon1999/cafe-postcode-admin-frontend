import Chip from '@mui/material/Chip';
import type { GridColDef } from '@mui/x-data-grid';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import {
  useResetRestaurantPasswordMutation,
  useRotateRestaurantAuthCodeMutation,
} from 'modules/product-owner/business-partners/application';
import type { AdminRestaurant } from 'shared/api/admin-types';
import { CustomGridActionsCellItem } from 'shared/ui/CustomDataGrid';
import { Iconify } from 'shared/ui/Iconify';
import { formatDate, formatDateTime } from 'shared/utils/format-time';

import { RestaurantDetailLinkCell, type RestaurantCredentialsDialogState } from '../../components';

interface RestaurantsGridColumnActions {
  onCreateBranch: (restaurant: AdminRestaurant) => void;
  onActivate: (restaurant: AdminRestaurant) => void;
  onCredentials: (state: RestaurantCredentialsDialogState) => void;
  onDeactivate: (restaurant: AdminRestaurant) => void;
  onDelete: (restaurant: AdminRestaurant) => void;
  onExtend: (restaurant: AdminRestaurant) => void;
}

export function useRestaurantsGridColumns(actions: RestaurantsGridColumnActions) {
  const { t } = useTranslate('organizations');
  const { t: tPlatform } = useTranslate('platform');
  const { t: tCommon } = useTranslate('common');
  const resetPasswordMutation = useResetRestaurantPasswordMutation();
  const rotateAuthCodeMutation = useRotateRestaurantAuthCodeMutation();

  const columns = useMemo<GridColDef<AdminRestaurant>[]>(
    () => [
      {
        field: 'name',
        headerName: t('fields.name'),
        minWidth: 220,
        flex: 1,
        renderCell: ({ row }) => <RestaurantDetailLinkCell id={row.id} name={row.name} />,
      },
      { field: 'phone', headerName: t('fields.phone'), minWidth: 160, flex: 0.7 },
      {
        field: 'tariff',
        headerName: t('fields.tariff'),
        minWidth: 180,
        flex: 0.8,
        sortable: false,
        valueGetter: (_value, row) =>
          row.tariff?.name ?? (row.activationType === 'custom' ? tPlatform('labels.customActivation') : null),
      },
      {
        field: 'billingPeriod',
        headerName: tPlatform('fields.billingPeriod'),
        minWidth: 150,
        flex: 0.65,
        valueGetter: (_value, row) => {
          if (row.billingPeriod === 'monthly') return tPlatform('labels.monthly');
          if (row.billingPeriod === 'yearly') return tPlatform('labels.yearly');
          return null;
        },
      },
      {
        field: 'activatedAt',
        headerName: tPlatform('fields.activatedAt'),
        minWidth: 180,
        flex: 0.8,
        renderCell: ({ row }) => (row.activatedAt ? formatDateTime(row.activatedAt) : '-'),
      },
      {
        field: 'expiresOn',
        headerName: tPlatform('fields.expiresOn'),
        minWidth: 160,
        flex: 0.7,
        renderCell: ({ row }) => (row.expiresOn ? formatDate(row.expiresOn) : '-'),
      },
      {
        field: 'isActive',
        headerName: t('fields.status'),
        minWidth: 120,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={row.isActive ? tCommon('status.active') : tCommon('status.inactive')}
            color={row.isActive ? 'success' : 'default'}
            variant="soft"
          />
        ),
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: tCommon('actions.title'),
        minWidth: 90,
        getActions: ({ row }) =>
          [
            <CustomGridActionsCellItem
              actionKind="edit"
              key="edit"
              label={t('actions.edit')}
              icon={<Iconify icon="solar:pen-bold" />}
              href={RouterPathHelper.organizationRestaurantEdit(row.id)}
            />,
            row.parentId ? null : (
              <CustomGridActionsCellItem
                actionKind="view"
                key="create-branch"
                label={t('actions.createBranch')}
                icon={<Iconify icon="solar:buildings-2-bold" />}
                showInMenu
                onClick={() => actions.onCreateBranch(row)}
              />
            ),
            <CustomGridActionsCellItem
              actionKind="view"
              key="reset-password"
              label={tPlatform('actions.resetPassword')}
              icon={<Iconify icon="solar:refresh-bold" />}
              showInMenu
              disabled={!row.isActive}
              onClick={async () => {
                const result = await resetPasswordMutation.mutateAsync(row.id);
                actions.onCredentials({
                  credentials: { username: result.username, password: result.password },
                  authCode: null,
                  mode: 'reset',
                });
              }}
            />,
            <CustomGridActionsCellItem
              actionKind="view"
              key="rotate-auth-code"
              label={tPlatform('actions.rotateAuthCode')}
              icon={<Iconify icon="solar:refresh-bold" />}
              showInMenu
              disabled={!row.isActive}
              onClick={async () => {
                const result = await rotateAuthCodeMutation.mutateAsync(row.id);
                actions.onCredentials({
                  credentials: null,
                  authCode: result.authCode ?? null,
                  mode: 'auth_code',
                });
              }}
            />,
            row.billingPeriod ? (
              <CustomGridActionsCellItem
                actionKind="view"
                key="extend"
                label={tPlatform('actions.extend')}
                icon={<Iconify icon="solar:calendar-add-bold" />}
                showInMenu
                onClick={() => actions.onExtend(row)}
              />
            ) : null,
            <CustomGridActionsCellItem
              actionKind={row.isActive ? 'delete' : 'view'}
              key="activate"
              label={row.isActive ? tPlatform('actions.deactivate') : tPlatform('actions.activate')}
              icon={<Iconify icon={row.isActive ? 'solar:lock-keyhole-bold' : 'solar:play-bold'} />}
              onClick={() => (row.isActive ? actions.onDeactivate(row) : actions.onActivate(row))}
            />,
            <CustomGridActionsCellItem
              actionKind="delete"
              key="delete"
              label={t('actions.delete')}
              icon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => actions.onDelete(row)}
            />,
          ].filter(Boolean) as ReactElement[],
      },
    ],
    [actions, resetPasswordMutation, rotateAuthCodeMutation, t, tCommon, tPlatform],
  );

  return {
    columns,
    isMutating: resetPasswordMutation.isPending || rotateAuthCodeMutation.isPending,
  };
}
