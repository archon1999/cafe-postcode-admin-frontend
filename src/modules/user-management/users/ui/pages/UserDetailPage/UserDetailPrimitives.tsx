import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { varAlpha } from 'minimal-shared/utils';
import type { ReactNode } from 'react';

import { EmptyValueChip, renderEmptyValue } from 'shared/ui/EmptyValue';
import { Iconify, type IconifyName } from 'shared/ui/Iconify';
import { Label } from 'shared/ui/Label';

export type UserEntry = {
  label: string;
  value?: ReactNode;
  icon: IconifyName;
};

export function getUserInitials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function formatBirthDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value : new Intl.DateTimeFormat('uz-UZ').format(parsedDate);
}

export function resolveStatusColor(status: 'active' | 'inactive' | 'archived') {
  if (status === 'active') {
    return 'success' as const;
  }
  if (status === 'inactive') {
    return 'warning' as const;
  }
  return 'default' as const;
}

export function SectionCard({ title, icon, children }: { title: string; icon: IconifyName; children: ReactNode }) {
  return (
    <Card sx={{ p: { xs: 2, md: 2.5 } }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={(theme) => ({
              width: 36,
              height: 36,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              color: 'primary.main',
              bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
            })}>
            <Iconify icon={icon} width={18} />
          </Box>
          <Typography variant="subtitle1">{title}</Typography>
        </Stack>
        {children}
      </Stack>
    </Card>
  );
}

export function DenseRow({ label, value, icon }: UserEntry) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start" justifyContent="space-between">
      <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
        <Box
          sx={(theme) => ({
            width: 28,
            height: 28,
            borderRadius: 1.25,
            display: 'grid',
            placeItems: 'center',
            color: 'text.secondary',
            bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            flexShrink: 0,
          })}>
          <Iconify icon={icon} width={15} />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
      </Stack>
      <Box sx={{ typography: 'subtitle2', textAlign: 'right', minWidth: 0 }}>{renderEmptyValue(value)}</Box>
    </Stack>
  );
}

export function HallChips({ halls }: { halls: string[] }) {
  if (!halls.length) {
    return <EmptyValueChip />;
  }

  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {halls.map((hall) => (
        <Label key={hall} variant="soft" color="default">
          {hall}
        </Label>
      ))}
    </Stack>
  );
}

export function SummaryChip({ title, children, icon }: { title: string; children: ReactNode; icon?: IconifyName }) {
  return (
    <Tooltip title={title} arrow>
      <Box component="span">
        <Label variant="soft" color="default" startIcon={icon ? <Iconify icon={icon} width={14} /> : undefined}>
          {children}
        </Label>
      </Box>
    </Tooltip>
  );
}
