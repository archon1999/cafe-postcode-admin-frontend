import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import type { CatalogCategory, CatalogItem } from 'shared/api/admin-types';
import { EmptyContent } from 'shared/ui/EmptyContent';
import { Iconify } from 'shared/ui/Iconify';
import { formatMoney } from 'shared/utils/format-money';

import { useGetCatalogCategoriesListQuery, useGetCatalogItemsListQuery } from '../../../application';
import { CatalogCategoryFormDialog } from '../../components/CatalogCategoryForm';
import { CatalogItemFormDialog } from '../../components/CatalogItemForm';

const CATEGORY_PAGE_SIZE = 500;
const ITEM_PAGE_SIZE = 500;

type CategoryCardProps = {
  category: CatalogCategory;
  isSelected: boolean;
  onSelect: (categoryId: string) => void;
};

type ItemCardProps = {
  item: CatalogItem;
  onEdit: (item: CatalogItem) => void;
};

function CategoryCard({ category, isSelected, onSelect }: CategoryCardProps) {
  const [isImageBroken, setIsImageBroken] = useState(false);
  const hasImage = Boolean(category.imageUrl) && !isImageBroken;

  return (
    <ButtonBase
      onClick={() => onSelect(category.id)}
      sx={{
        position: 'relative',
        width: 1,
        minHeight: 208,
        px: 2,
        py: 2.5,
        borderRadius: 0,
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        bgcolor: isSelected ? 'action.selected' : 'background.paper',
        boxShadow: isSelected ? (theme) => `0 0 0 1px ${theme.vars.palette.primary.main}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        textAlign: 'center',
        opacity: category.isActive ? 1 : 0.72,
        transition: (theme) =>
          theme.transitions.create(['border-color', 'background-color', 'transform', 'box-shadow']),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[4],
        },
      }}>
      {isSelected ? (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 26,
            height: 26,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}>
          <Iconify icon="solar:check-circle-bold" width={16} />
        </Box>
      ) : null}

      <Box
        sx={{
          width: 92,
          height: 92,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          bgcolor: hasImage ? 'grey.100' : 'background.neutral',
        }}>
        {hasImage ? (
          <Box
            component="img"
            src={category.imageUrl ?? undefined}
            alt={category.name}
            onError={() => setIsImageBroken(true)}
            sx={{ width: 1, height: 1, objectFit: 'cover' }}
          />
        ) : (
          <Iconify icon="solar:gallery-wide-bold-duotone" width={34} sx={{ color: 'text.secondary' }} />
        )}
      </Box>

      <Typography
        variant="subtitle2"
        sx={{
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          overflow: 'hidden',
        }}>
        {category.name}
      </Typography>
    </ButtonBase>
  );
}

function ItemCard({ item, onEdit }: ItemCardProps) {
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
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            overflow: 'hidden',
          }}>
          {item.name}
        </Typography>

        <Tooltip title={t('actions.edit', { defaultValue: 'Tahrirlash' })}>
          <IconButton size="small" onClick={() => onEdit(item)} sx={{ flexShrink: 0 }}>
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip
          size="small"
          variant="soft"
          color={item.isActive ? 'success' : 'default'}
          label={item.isActive ? tCommon('status.active') : tCommon('status.inactive')}
        />
        <Chip
          size="small"
          variant="soft"
          color={item.isStoplisted ? 'error' : 'info'}
          label={item.isStoplisted ? t('labels.stoplisted') : t('labels.available')}
        />
      </Stack>

      <Box sx={{ mt: 'auto' }}>
        <Typography variant="h6">{formatMoney(item.price)}</Typography>
      </Box>
    </Card>
  );
}

const CatalogBrowserPage = () => {
  const { t } = useTranslate('catalog');
  const { disabled: isCreateCategoryDisabled } = useAdminCreateAccess(RoutePath.catalogCategoryCreate);
  const { disabled: isCreateItemDisabled } = useAdminCreateAccess(RoutePath.catalogItemCreate);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCategoryCreateOpen, setCategoryCreateOpen] = useState(false);
  const [isCategoryEditOpen, setCategoryEditOpen] = useState(false);
  const [isItemCreateOpen, setItemCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  const categoriesQuery = useGetCatalogCategoriesListQuery({
    page: 1,
    pageSize: CATEGORY_PAGE_SIZE,
    ordering: 'sortOrder,name',
  });
  const categories = useMemo(() => categoriesQuery.data?.data ?? [], [categoriesQuery.data]);

  useEffect(() => {
    if (!categories.length) {
      setSelectedCategoryId(null);
      return;
    }

    if (selectedCategoryId && categories.some((category) => category.id === selectedCategoryId)) {
      return;
    }

    const firstActiveCategory = categories.find((category) => category.isActive) ?? categories[0];
    setSelectedCategoryId(firstActiveCategory.id);
  }, [categories, selectedCategoryId]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  const itemsQuery = useGetCatalogItemsListQuery(
    {
      page: 1,
      pageSize: ITEM_PAGE_SIZE,
      categoryIdIn: selectedCategoryId ?? undefined,
      ordering: 'name',
    },
    { enabled: Boolean(selectedCategoryId) },
  );

  const items = useMemo(() => itemsQuery.data?.data ?? [], [itemsQuery.data]);
  const isCategoryLoading = categoriesQuery.isLoading && !categories.length;
  const isItemLoading = itemsQuery.isLoading && !items.length;
  const isRefreshingItems = itemsQuery.isFetching && !isItemLoading;

  return (
    <ListPageContent>
      <ListPageBody>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', xl: 'minmax(320px, 5fr) minmax(0, 8fr)' },
            gap: 3,
            flex: 1,
            minHeight: 0,
          }}>
          <Card sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', borderRadius: 0 }}>
            <Box sx={{ px: 2.5, py: 2.25, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
                <Typography variant="h6">{t('pages.categories.title')}</Typography>

                <Stack direction="row" spacing={0.5}>
                  <Tooltip title={t('actions.createCategory', { defaultValue: 'Yangi kategoriya' })}>
                    <span>
                      <IconButton onClick={() => setCategoryCreateOpen(true)} disabled={isCreateCategoryDisabled}>
                        <Iconify icon="mingcute:add-line" width={20} />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title={t('actions.edit', { defaultValue: 'Tahrirlash' })}>
                    <span>
                      <IconButton onClick={() => setCategoryEditOpen(true)} disabled={!selectedCategory}>
                        <Iconify icon="solar:pen-bold" width={18} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ p: 2.5, flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {isCategoryLoading ? (
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
                    <CategoryCard
                      key={category.id}
                      category={category}
                      isSelected={category.id === selectedCategoryId}
                      onSelect={setSelectedCategoryId}
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
                      onClick={() => setCategoryCreateOpen(true)}
                      sx={{ mt: 3 }}>
                      {t('actions.createCategory', { defaultValue: 'Yangi kategoriya' })}
                    </Button>
                  }
                />
              )}
            </Box>
          </Card>

          <Card sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', borderRadius: 0 }}>
            {isRefreshingItems ? <LinearProgress /> : null}

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
                  disabled={isCreateItemDisabled || !selectedCategory}
                  onClick={() => setItemCreateOpen(true)}>
                  {t('actions.createItem', { defaultValue: 'Yangi mahsulot' })}
                </Button>
              </Stack>
            </Box>

            <Box sx={{ p: 2.5, flex: 1, minHeight: 0, overflowY: 'auto' }}>
              {!selectedCategoryId && !isCategoryLoading ? (
                <EmptyContent
                  filled
                  title={t('empty.browser.noCategoryTitle', { defaultValue: 'Kategoriya tanlanmagan' })}
                  description={t('empty.browser.noCategoryDescription', {
                    defaultValue: 'Mahsulotlarni ko‘rish uchun chap tomondan kategoriya tanlang.',
                  })}
                />
              ) : isItemLoading ? (
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
              ) : items.length ? (
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
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} onEdit={setEditingItem} />
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
                        disabled={isCreateItemDisabled}
                        onClick={() => setItemCreateOpen(true)}
                        sx={{ mt: 3 }}>
                        {t('actions.createItem', { defaultValue: 'Yangi mahsulot' })}
                      </Button>
                    ) : null
                  }
                />
              )}
            </Box>
          </Card>
        </Box>
      </ListPageBody>

      <Dialog open={isCategoryCreateOpen} onClose={() => setCategoryCreateOpen(false)} maxWidth="sm" fullWidth>
        <CatalogCategoryFormDialog
          onCancel={() => setCategoryCreateOpen(false)}
          onSuccess={(category) => {
            setSelectedCategoryId(category.id);
            setCategoryCreateOpen(false);
          }}
        />
      </Dialog>

      <Dialog open={isCategoryEditOpen} onClose={() => setCategoryEditOpen(false)} maxWidth="sm" fullWidth>
        <CatalogCategoryFormDialog
          category={selectedCategory}
          onCancel={() => setCategoryEditOpen(false)}
          onSuccess={() => setCategoryEditOpen(false)}
        />
      </Dialog>

      <Dialog open={isItemCreateOpen} onClose={() => setItemCreateOpen(false)} maxWidth="md" fullWidth>
        <CatalogItemFormDialog
          defaultCategoryId={selectedCategoryId}
          onCancel={() => setItemCreateOpen(false)}
          onSuccess={() => setItemCreateOpen(false)}
        />
      </Dialog>

      <Dialog open={Boolean(editingItem)} onClose={() => setEditingItem(null)} maxWidth="md" fullWidth>
        <CatalogItemFormDialog
          item={editingItem}
          onCancel={() => setEditingItem(null)}
          onSuccess={() => setEditingItem(null)}
        />
      </Dialog>
    </ListPageContent>
  );
};

export default CatalogBrowserPage;
