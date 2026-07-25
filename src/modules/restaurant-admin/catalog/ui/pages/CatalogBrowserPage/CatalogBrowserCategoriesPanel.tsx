import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useAdminRestaurantScopeId } from 'modules/auth';
import type { CatalogCategory } from 'shared/api/admin-types';
import { EmptyContent } from 'shared/ui/EmptyContent';
import { Iconify } from 'shared/ui/Iconify';
import { SortableGrid } from 'shared/ui/SortableGrid';

import { CatalogBrowserCategoryCard } from './CatalogBrowserCategoryCard';

type CatalogBrowserCategoriesPanelProps = {
  categories: CatalogCategory[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  onSelectCategory: (categoryId: string) => void;
  onCreateCategory: () => void;
  onEditCategory: () => void;
  canEditCategory: boolean;
  isReordering: boolean;
  onReorder: (categories: CatalogCategory[]) => Promise<unknown>;
};

export function CatalogBrowserCategoriesPanel({
  categories,
  selectedCategoryId,
  isLoading,
  onSelectCategory,
  onCreateCategory,
  onEditCategory,
  canEditCategory,
  isReordering,
  onReorder,
}: CatalogBrowserCategoriesPanelProps) {
  const { t } = useTranslate('catalog');
  const restaurantId = useAdminRestaurantScopeId();
  const { disabled: isCreateCategoryDisabled } = useAdminCreateAccess(RoutePath.catalogCategoryCreate);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', borderRadius: 0 }}>
      <Box sx={{ px: 2.5, py: 2.25, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
          <Typography variant="h6">{t('pages.categories.title')}</Typography>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title={t('actions.createCategory')}>
              <span>
                <IconButton onClick={onCreateCategory} disabled={isCreateCategoryDisabled}>
                  <Iconify icon="mingcute:add-line" width={20} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={t('actions.edit')}>
              <span>
                <IconButton onClick={onEditCategory} disabled={!canEditCategory || !restaurantId}>
                  <Iconify icon="solar:pen-bold" width={18} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ p: 2.5, flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.5 }}>
            {Array.from({ length: 9 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={208} />
            ))}
          </Box>
        ) : categories.length ? (
          <SortableGrid
            items={categories}
            gridTemplateColumns={{ xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' }}
            gap={1.5}
            dragLabel={t('labels.dragToReorder')}
            disabled={isReordering || !restaurantId}
            onReorder={onReorder}
            renderItem={(category) => (
              <CatalogBrowserCategoryCard
                category={category}
                isSelected={category.id === selectedCategoryId}
                onSelect={onSelectCategory}
              />
            )}
          />
        ) : (
          <EmptyContent
            filled
            title={t('empty.categories.noData.title')}
            description={t('empty.categories.noData.description')}
            action={
              <Button
                variant="contained"
                color="black"
                startIcon={<Iconify icon="mingcute:add-line" />}
                disabled={isCreateCategoryDisabled}
                onClick={onCreateCategory}
                sx={{ mt: 3 }}>
                {t('actions.createCategory')}
              </Button>
            }
          />
        )}
      </Box>
    </Card>
  );
}
