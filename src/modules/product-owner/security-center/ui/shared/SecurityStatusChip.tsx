import Chip, { type ChipProps } from '@mui/material/Chip';

import type { SecuritySeverity } from '../../domain';

type SecurityStatus = SecuritySeverity;

const COLORS: Record<SecurityStatus, ChipProps['color']> = {
  INFO: 'info',
  LOW: 'default',
  MEDIUM: 'warning',
  HIGH: 'error',
  CRITICAL: 'error',
};

export function SecurityStatusChip({ status, label }: { status: SecurityStatus; label: string }) {
  return <Chip size="small" variant={status === 'CRITICAL' ? 'filled' : 'soft'} color={COLORS[status]} label={label} />;
}
