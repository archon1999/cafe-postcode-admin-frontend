import { IconButton, Tooltip } from '@mui/material';
import type { ReactNode } from 'react';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';

export function InventoryHelp({ children }: { children: ReactNode }) {
  const { t } = useTranslate('inventory');
  if (!children) return null;
  return (
    <Tooltip title={children} arrow describeChild>
      <IconButton aria-label={t('help')}>
        <Iconify icon="solar:info-circle-bold" width={22} />
      </IconButton>
    </Tooltip>
  );
}
