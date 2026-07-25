import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { useShowAllBranches } from 'app/layouts/components/branch-scope-columns';
import { useTranslate } from 'app/providers/locales';
import { useAdminRestaurantScopeId } from 'modules/auth';
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
  const showBranchName = useShowAllBranches();
  const restaurantId = useAdminRestaurantScopeId();
  const [isImageBroken, setIsImageBroken] = useState(false);
  const hasImage = Boolean(product.imageUrl) && !isImageBroken;

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
      <Box
        sx={{
          width: 1,
          aspectRatio: '4 / 3',
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          bgcolor: hasImage ? 'grey.100' : 'background.neutral',
        }}>
        {hasImage ? (
          <Box
            component="img"
            src={product.imageUrl ?? undefined}
            alt={product.name}
            onError={() => setIsImageBroken(true)}
            sx={{ width: 1, height: 1, objectFit: 'cover' }}
          />
        ) : (
          <Iconify icon="solar:gallery-wide-bold-duotone" width={34} sx={{ color: 'text.secondary' }} />
        )}
      </Box>

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
          <IconButton size="small" disabled={!restaurantId} onClick={() => onEdit(product)} sx={{ flexShrink: 0 }}>
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        </Tooltip>
      </Stack>

      {showBranchName ? (
        <Typography variant="caption" color="text.secondary">
          {product.restaurantName || '-'}
        </Typography>
      ) : null}

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
