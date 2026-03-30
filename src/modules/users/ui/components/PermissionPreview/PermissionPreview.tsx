import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRef, useState } from 'react';

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
  const closeTimerRef = useRef<number | null>(null);

  const permissionLabels = permissions.map((permission) => ({
    code: permission.code,
    label: getAdminPermissionLabel(permission, t),
  }));
  const visiblePermissions = permissionLabels.slice(0, maxVisible);
  const hiddenPermissions = permissionLabels.slice(maxVisible);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => setAnchorEl(null), 100);
  };

  if (!permissions.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        -
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Stack direction="row" spacing={0.75} sx={{ minWidth: 0, flexWrap: 'nowrap', overflow: 'hidden' }}>
        {visiblePermissions.map((permission) => (
          <Label
            key={permission.code}
            color="default"
            variant="soft"
            sx={{ whiteSpace: 'nowrap', maxWidth: 160 }}
            title={permission.label}>
            {permission.label}
          </Label>
        ))}
      </Stack>

      {hiddenPermissions.length > 0 && (
        <>
          <IconButton
            size="small"
            onMouseEnter={(event) => {
              clearCloseTimer();
              setAnchorEl(event.currentTarget);
            }}
            onMouseLeave={scheduleClose}
            aria-label={t('labels.morePermissions')}>
            <Iconify icon="solar:menu-dots-bold" width={18} />
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
                onMouseEnter: clearCloseTimer,
                onMouseLeave: scheduleClose,
                sx: {
                  p: 1.5,
                  minWidth: 280,
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
        </>
      )}
    </Box>
  );
}
