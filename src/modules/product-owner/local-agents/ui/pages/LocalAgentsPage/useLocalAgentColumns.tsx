import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { GridColDef } from '@mui/x-data-grid';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useAdminScopeStore } from 'modules/auth';
import type { AdminLocalAgent } from 'shared/api/admin-types';
import { DetailPageLink } from 'shared/ui/DetailPageLink/DetailPageLink';
import { Iconify } from 'shared/ui/Iconify';
import { formatDateTime } from 'shared/utils/format-time';

export function useLocalAgentColumns(onDiagnostics: (agent: AdminLocalAgent) => void) {
  const { t } = useTranslate('platform');
  const queryClient = useQueryClient();
  const setSelectedRestaurantId = useAdminScopeStore((state) => state.setSelectedRestaurantId);

  return useMemo<GridColDef<AdminLocalAgent>[]>(
    () => [
      {
        field: 'restaurantName',
        headerName: t('localAgents.fields.restaurant'),
        minWidth: 260,
        flex: 1,
        renderCell: ({ row }) => (
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
              <DetailPageLink
                href={RoutePath.organizationMyRestaurantSetup}
                onClick={() => {
                  setSelectedRestaurantId(row.restaurantId);
                  void queryClient.invalidateQueries();
                }}>
                {row.restaurantName}
              </DetailPageLink>
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.name}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'status',
        headerName: t('localAgents.fields.status'),
        minWidth: 140,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            variant="soft"
            color={row.online ? 'success' : 'error'}
            label={t(`localAgents.status.${row.online ? 'online' : 'offline'}`)}
          />
        ),
      },
      {
        field: 'version',
        headerName: t('localAgents.fields.version'),
        minWidth: 130,
        flex: 0.4,
        valueFormatter: (value) => value || '—',
      },
      {
        field: 'lastSeenAt',
        headerName: t('localAgents.fields.lastSeen'),
        minWidth: 210,
        flex: 0.65,
        valueFormatter: (value) => formatDateTime(value),
      },
      {
        field: 'actions',
        headerName: t('localAgents.fields.actions'),
        minWidth: 90,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Tooltip title={t('localAgents.actions.diagnostics')}>
            <IconButton color="primary" onClick={() => onDiagnostics(row)}>
              <Iconify icon="solar:info-circle-bold-duotone" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [onDiagnostics, queryClient, setSelectedRestaurantId, t],
  );
}
