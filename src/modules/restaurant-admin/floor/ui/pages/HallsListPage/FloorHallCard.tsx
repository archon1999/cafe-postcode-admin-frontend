import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminHall } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

type FloorHallCardProps = {
  hall: AdminHall;
  onEdit: (hall: AdminHall) => void;
};

export function FloorHallCard({ hall, onEdit }: FloorHallCardProps) {
  const { t } = useTranslate('floor');
  const { t: tCommon } = useTranslate('common');

  return (
    <Card
      sx={{
        p: 2,
        pt: 5.5,
        height: '100%',
        minHeight: 190,
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}>
      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
        <Typography variant="h6" sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
          {hall.name}
        </Typography>
        <Tooltip title={t('actions.edit')}>
          <IconButton size="small" onClick={() => onEdit(hall)} sx={{ flexShrink: 0 }}>
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          minHeight: '3em',
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
        }}>
        {hall.description || '\u00a0'}
      </Typography>

      <Chip
        size="small"
        variant="soft"
        color={hall.isActive ? 'success' : 'default'}
        label={hall.isActive ? tCommon('status.active') : tCommon('status.inactive')}
        sx={{ alignSelf: 'flex-start' }}
      />

      <Button
        component={RouterLink}
        href={RouterPathHelper.floorHallConstructor(hall.id)}
        color="inherit"
        variant="outlined"
        startIcon={<Iconify icon="solar:ruler-pen-bold" />}
        sx={{ mt: 'auto' }}>
        {t('actions.constructor')}
      </Button>
    </Card>
  );
}
