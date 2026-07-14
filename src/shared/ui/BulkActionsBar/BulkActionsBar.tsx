import { Box, Button, IconButton, Stack, Tooltip, Typography, type ButtonProps, type SxProps } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { Iconify } from 'shared/ui/Iconify';

export type BulkActionsBarAction = {
  key: string;
  label: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  color?: ButtonProps['color'];
  startIcon?: ReactNode;
  tooltip?: string;
};

type BulkActionsBarProps = {
  selectedCount: number;
  selectedLabel: ReactNode;
  summaryValue?: ReactNode;
  actions: BulkActionsBarAction[];
  onClose: () => void;
  sx?: SxProps;
};

export function BulkActionsBar({
  selectedCount,
  selectedLabel,
  summaryValue,
  actions,
  onClose,
  sx,
}: BulkActionsBarProps) {
  return (
    <Box
      sx={[
        (theme) => ({
          p: { xs: 2, md: 3 },
          bottom: 16,
          left: { xs: 16, md: '50%' },
          right: { xs: 16, md: 'auto' },
          borderRadius: 1,
          position: 'fixed',
          transform: { xs: 'none', md: 'translateX(-50%)' },
          zIndex: theme.zIndex.appBar - 1,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[8],
          maxWidth: { md: 'calc(100vw - 48px)' },
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={4}>
        <Stack spacing={1} sx={{ minWidth: 140 }}>
          <Typography variant="body2" color="text.secondary">
            {selectedLabel}
          </Typography>
          <Typography variant="subtitle2">{summaryValue ?? selectedCount}</Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
          {actions.map((action) => {
            const button = (
              <Button
                key={action.key}
                variant="contained"
                color={action.color ?? 'primary'}
                onClick={action.onClick}
                disabled={action.disabled}
                startIcon={action.startIcon}>
                {action.label}
              </Button>
            );

            return action.tooltip ? (
              <Tooltip key={action.key} title={action.tooltip} arrow>
                <Box component="span" sx={{ display: 'inline-flex' }}>
                  {button}
                </Box>
              </Tooltip>
            ) : (
              button
            );
          })}
          <IconButton onClick={onClose} aria-label="close">
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
