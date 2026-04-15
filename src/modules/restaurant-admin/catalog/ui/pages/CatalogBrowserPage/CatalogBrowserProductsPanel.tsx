import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import type { CatalogCategory, CatalogItem } from 'shared/api/admin-types';
import { EmptyContent } from 'shared/ui/EmptyContent';
import { Iconify } from 'shared/ui/Iconify';

import { CatalogBrowserProductCard } from './CatalogBrowserProductCard';

type CatalogBrowserProductsPanelProps = {
  selectedCategory: CatalogCategory | null;
  selectedCategoryId: string | null;
  products: CatalogItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  onCreateProduct: () => void;
  onEditProduct: (product: CatalogItem) => void;
};

export function CatalogBrowserProductsPanel({
  selectedCategory,
  selectedCategoryId,
  products,
  isLoading,
  isRefreshing,
  onCreateProduct,
  onEditProduct,
}: CatalogBrowserProductsPanelProps) {
  const { t } = useTranslate('catalog');
  const { disabled: isCreateProductDisabled } = useAdminCreateAccess(RoutePath.catalogItemCreate);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', borderRadius: 0 }}>
      {isRefreshing ? <LinearProgress /> : null}

      <Box sx={{ px: 2.5, py: 2.25, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between">
          <Typography variant="h6">{t('pages.items.title')}</Typography>

          <Button
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateProductDisabled || !selectedCategory}
            onClick={onCreateProduct}>
            {t('actions.createItem')}
          </Button>
        </Stack>
      </Box>

      <Box sx={{ p: 2.5, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {!selectedCategoryId ? (
          <EmptyContent
            filled
            title={t('empty.browser.noCategoryTitle')}
            description={t('empty.browser.noCategoryDescription')}
          />
        ) : isLoading ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2,
            }}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={198} />
            ))}
          </Box>
        ) : products.length ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                xl: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2,
            }}>
            {products.map((product) => (
              <CatalogBrowserProductCard key={product.id} product={product} onEdit={onEditProduct} />
            ))}
          </Box>
        ) : (
          <EmptyContent
            filled
            title={t('empty.items.noData.title')}
            description={t('empty.items.noData.description')}
            action={
              selectedCategory ? (
                <Button
                  variant="contained"
                  color="black"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  disabled={isCreateProductDisabled}
                  onClick={onCreateProduct}
                  sx={{ mt: 3 }}>
                  {t('actions.createItem')}
                </Button>
              ) : null
            }
          />
        )}
      </Box>
    </Card>
  );
}
