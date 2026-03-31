import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import type { AdminPermission } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';
import { Label } from 'shared/ui/Label';
import { getAdminPermissionLabel } from 'shared/utils/admin-permission';

type PermissionPreviewProps = {
  permissions: AdminPermission[];
  t: (key: string) => string;
  maxVisible?: number;
};

export function PermissionPreview({ permissions, t, maxVisible = 3 }: PermissionPreviewProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const permissionLabels = permissions.map((permission) => ({
    code: permission.code,
    label: getAdminPermissionLabel(permission, t),
  }));
  const visiblePermissions = permissionLabels.slice(0, maxVisible);
  const hiddenPermissions = permissionLabels.slice(maxVisible);
  const previewText = visiblePermissions.map((permission) => permission.label).join(', ');

  if (!permissions.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        -
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, width: '100%' }}>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="caption" color="text.secondary" noWrap>
          {`${t('fields.permissions')}: ${permissions.length}`}
        </Typography>

        <Typography
          variant="body2"
          title={previewText}
          sx={{
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 500,
          }}>
          {previewText}
        </Typography>
      </Box>

      {hiddenPermissions.length > 0 && (
        <Label color="info" variant="soft" sx={{ flexShrink: 0 }}>
          +{hiddenPermissions.length}
        </Label>
      )}

      <IconButton
        size="small"
        onClick={(event) => setAnchorEl(anchorEl ? null : event.currentTarget)}
        aria-label={t('fields.permissions')}
        sx={{ flexShrink: 0 }}>
        <Iconify icon="solar:list-bold" width={16} />
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        disableRestoreFocus
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              p: 1.5,
              minWidth: 320,
              maxWidth: 420,
            },
          },
        }}>
        <Stack spacing={1}>
          {permissionLabels.map((permission) => (
            <Typography key={permission.code} variant="body2">
              {permission.label}
            </Typography>
          ))}
        </Stack>
      </Popover>
    </Box>
  );
}
