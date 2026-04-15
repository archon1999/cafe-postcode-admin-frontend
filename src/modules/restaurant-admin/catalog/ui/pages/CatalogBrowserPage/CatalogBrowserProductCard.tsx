import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'app/providers/locales';
import type { CatalogItem } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';
import { formatMoney } from 'shared/utils/format-money';

type CatalogBrowserProductCardProps = {
  product: CatalogItem;
  onEdit: (product: CatalogItem) => void;
};

export function CatalogBrowserProductCard({ product, onEdit }: CatalogBrowserProductCardProps) {
  const { t } = useTranslate('catalog');
  const { t: tCommon } = useTranslate('common');

  return (
    <Card
      sx={{
        p: 2,
        minHeight: 198,
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}>
      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="flex-start">
        <Typography
          variant="subtitle1"
          sx={{
            minWidth: 0,
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
          }}>
          {product.name}
        </Typography>

        <Tooltip title={t('actions.edit')}>
          <IconButton size="small" onClick={() => onEdit(product)} sx={{ flexShrink: 0 }}>
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip
          size="small"
          variant="soft"
          color={product.isActive ? 'success' : 'default'}
          label={product.isActive ? tCommon('status.active') : tCommon('status.inactive')}
        />
        <Chip
          size="small"
          variant="soft"
          color={product.isStoplisted ? 'error' : 'info'}
          label={product.isStoplisted ? t('labels.stoplisted') : t('labels.available')}
        />
      </Stack>

      <Box sx={{ mt: 'auto' }}>
        <Typography variant="h6">{formatMoney(product.price)}</Typography>
      </Box>
    </Card>
  );
}
