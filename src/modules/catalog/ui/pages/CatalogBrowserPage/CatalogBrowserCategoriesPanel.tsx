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
import type { CatalogCategory } from 'shared/api/admin-types';
import { EmptyContent } from 'shared/ui/EmptyContent';
import { Iconify } from 'shared/ui/Iconify';

import { CatalogBrowserCategoryCard } from './CatalogBrowserCategoryCard';

type CatalogBrowserCategoriesPanelProps = {
  categories: CatalogCategory[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  onSelectCategory: (categoryId: string) => void;
  onCreateCategory: () => void;
  onEditCategory: () => void;
  canEditCategory: boolean;
};

export function CatalogBrowserCategoriesPanel({
  categories,
  selectedCategoryId,
  isLoading,
  onSelectCategory,
  onCreateCategory,
  onEditCategory,
  canEditCategory,
}: CatalogBrowserCategoriesPanelProps) {
  const { t } = useTranslate('catalog');
  const { disabled: isCreateCategoryDisabled } = useAdminCreateAccess(RoutePath.catalogCategoryCreate);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', borderRadius: 0 }}>
      <Box sx={{ px: 2.5, py: 2.25, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
          <Typography variant="h6">{t('pages.categories.title')}</Typography>

          <Stack direction="row" spacing={0.5}>
            <Tooltip title={t('actions.createCategory', { defaultValue: 'Yangi kategoriya' })}>
              <span>
                <IconButton onClick={onCreateCategory} disabled={isCreateCategoryDisabled}>
                  <Iconify icon="mingcute:add-line" width={20} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={t('actions.edit', { defaultValue: 'Tahrirlash' })}>
              <span>
                <IconButton onClick={onEditCategory} disabled={!canEditCategory}>
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
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))' },
              gap: 1.5,
            }}>
            {categories.map((category) => (
              <CatalogBrowserCategoryCard
                key={category.id}
                category={category}
                isSelected={category.id === selectedCategoryId}
                onSelect={onSelectCategory}
              />
            ))}
          </Box>
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
                {t('actions.createCategory', { defaultValue: 'Yangi kategoriya' })}
              </Button>
            }
          />
        )}
      </Box>
    </Card>
  );
}
