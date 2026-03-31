import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper } from 'app/routes';
import type { CatalogCategory, CatalogItem } from 'shared/api/admin-types';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { EmptyContent } from 'shared/ui/EmptyContent';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';
import { formatMoney } from 'shared/utils/format-money';

import { useGetCatalogCategoriesListQuery, useGetCatalogItemsListQuery } from '../../../application';

const CATEGORY_PAGE_SIZE = 500;
const ITEM_PAGE_SIZE = 500;

type ItemStatusFilter = 'all' | 'active' | 'inactive';
type StoplistFilter = 'all' | 'available' | 'stoplisted';

type CategoryCardProps = {
  category: CatalogCategory;
  isSelected: boolean;
  onSelect: (categoryId: string) => void;
};

type ItemCardProps = {
  item: CatalogItem;
};

function CategoryCard({ category, isSelected, onSelect }: CategoryCardProps) {
  const { t } = useTranslate('common');
  const [isImageBroken, setIsImageBroken] = useState(false);
  const hasImage = Boolean(category.imageUrl) && !isImageBroken;

  return (
    <ButtonBase
      onClick={() => onSelect(category.id)}
      sx={{
        width: 1,
        textAlign: 'left',
        borderRadius: 3,
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        backgroundColor: isSelected ? 'action.selected' : 'background.paper',
        p: 1.25,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 1.25,
      }}>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          aspectRatio: '1 / 0.78',
          background: hasImage
            ? 'linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.08))'
            : 'linear-gradient(135deg, rgba(18,18,18,0.04), rgba(18,18,18,0.12))',
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
          <Box
            sx={{
              width: 1,
              height: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}>
            <Iconify icon="solar:gallery-wide-bold-duotone" width={32} />
          </Box>
        )}

        <Chip
          size="small"
          label={category.isActive ? t('status.active') : t('status.inactive')}
          color={category.isActive ? 'success' : 'default'}
          sx={{ position: 'absolute', top: 10, right: 10 }}
        />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>
          {category.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {category.mxikCode ? `MXIK: ${category.mxikCode}` : '-'}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

function ItemCard({ item }: ItemCardProps) {
  const { t } = useTranslate('catalog');
  const { t: tCommon } = useTranslate('common');

  return (
    <Card
      sx={{
        p: 2,
        minHeight: 208,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}>
      <Stack direction="row" spacing={1} alignItems="flex-start" justifyContent="space-between">
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>
            {item.name}
          </Typography>
          {item.description ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>
              {item.description}
            </Typography>
          ) : null}
        </Box>

        <Tooltip title={t('actions.edit', { defaultValue: 'Tahrirlash' })}>
          <IconButton
            component={RouterLink}
            href={RouterPathHelper.catalogItemEdit(item.id)}
            size="small"
            sx={{ flexShrink: 0 }}>
            <Iconify icon="solar:pen-bold" width={18} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip
          size="small"
          label={item.isActive ? tCommon('status.active') : tCommon('status.inactive')}
          color={item.isActive ? 'success' : 'default'}
          variant="soft"
        />
        <Chip
          size="small"
          label={item.isStoplisted ? t('labels.stoplisted') : t('labels.available')}
          color={item.isStoplisted ? 'error' : 'info'}
          variant="soft"
        />
      </Stack>

      <Box sx={{ mt: 'auto' }}>
        <Typography variant="h6">{formatMoney(item.price)}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          {item.mxikCode ? `MXIK: ${item.mxikCode}` : '-'}
        </Typography>
      </Box>
    </Card>
  );
}

const CatalogBrowserPage = () => {
  const { t } = useTranslate('catalog');
  const { disabled: isCreateCategoryDisabled } = useAdminCreateAccess(RoutePath.catalogCategoryCreate);
  const { disabled: isCreateItemDisabled } = useAdminCreateAccess(RoutePath.catalogItemCreate);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [itemStatusFilter, setItemStatusFilter] = useState<ItemStatusFilter>('all');
  const [stoplistFilter, setStoplistFilter] = useState<StoplistFilter>('all');

  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim();

  const categoriesQuery = useGetCatalogCategoriesListQuery({
    page: 1,
    pageSize: CATEGORY_PAGE_SIZE,
    ordering: 'sortOrder,name',
  });

  const categories = categoriesQuery.data?.data ?? [];

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
      search: normalizedSearch || undefined,
      categoryIdIn: selectedCategoryId ?? undefined,
      isActive:
        itemStatusFilter === 'all' ? undefined : itemStatusFilter === 'active',
      isStoplisted:
        stoplistFilter === 'all' ? undefined : stoplistFilter === 'stoplisted',
      ordering: 'name',
    },
    { enabled: Boolean(selectedCategoryId) },
  );

  const items = itemsQuery.data?.data ?? [];
  const isCategoryLoading = categoriesQuery.isLoading && !categories.length;
  const isItemLoading = itemsQuery.isLoading && !items.length;
  const isRefreshingItems = itemsQuery.isFetching && !isItemLoading;

  const filterChipSx = { borderRadius: 999 };

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.browser.title', { defaultValue: 'Katalog brauzeri' })}
        links={[{ name: t('pages.browser.title', { defaultValue: 'Katalog brauzeri' }) }]}
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              component={RouterLink}
              href={RoutePath.catalogCategoryCreate}
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="mingcute:add-line" />}
              disabled={isCreateCategoryDisabled}>
              {t('actions.createCategory', { defaultValue: 'Yangi kategoriya' })}
            </Button>
            <Button
              component={RouterLink}
              href={RoutePath.catalogItemCreate}
              variant="contained"
              color="black"
              startIcon={<Iconify icon="mingcute:add-line" />}
              disabled={isCreateItemDisabled}>
              {t('actions.createItem', { defaultValue: 'Yangi mahsulot' })}
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ListPageBody>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '340px minmax(0, 1fr)' },
            gap: 3,
            width: 1,
            minHeight: 0,
          }}>
          <Card sx={{ p: 2.5, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6">{t('pages.categories.title')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {categoriesQuery.data?.total ?? categories.length} {t('fields.category', { defaultValue: 'Kategoriya' }).toLowerCase()}
                </Typography>
              </Box>

              {selectedCategory ? (
                <Tooltip title={t('actions.edit', { defaultValue: 'Tahrirlash' })}>
                  <IconButton component={RouterLink} href={RouterPathHelper.catalogCategoryEdit(selectedCategory.id)} size="small">
                    <Iconify icon="solar:pen-bold" width={18} />
                  </IconButton>
                </Tooltip>
              ) : null}
            </Stack>

            {isCategoryLoading ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: '1fr' },
                  gap: 1.5,
                }}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} variant="rounded" height={140} />
                ))}
              </Box>
            ) : categories.length ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: '1fr' },
                  gap: 1.5,
                  overflowY: 'auto',
                  pr: { lg: 0.5 },
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
                    component={RouterLink}
                    href={RoutePath.catalogCategoryCreate}
                    variant="contained"
                    color="black"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    disabled={isCreateCategoryDisabled}
                    sx={{ mt: 3 }}>
                    {t('actions.createCategory', { defaultValue: 'Yangi kategoriya' })}
                  </Button>
                }
              />
            )}
          </Card>

          <Card sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
            {isRefreshingItems ? <LinearProgress /> : null}

            <Box sx={{ p: 2.5 }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ xs: 'stretch', md: 'flex-start' }}
                justifyContent="space-between">
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography variant="h6">
                      {selectedCategory?.name ?? t('pages.items.title')}
                    </Typography>
                    {selectedCategory ? (
                      <Chip size="small" label={`${itemsQuery.data?.total ?? items.length}`} color="primary" variant="soft" />
                    ) : null}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    {selectedCategory?.mxikCode
                      ? `MXIK: ${selectedCategory.mxikCode}`
                      : t('labels.mxikOptional', { defaultValue: 'Mahsulot uchun MXIK kodi ixtiyoriy.' })}
                  </Typography>
                </Box>

                {selectedCategory ? (
                  <Button
                    component={RouterLink}
                    href={RoutePath.catalogItemCreate}
                    variant="outlined"
                    color="inherit"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    disabled={isCreateItemDisabled}>
                    {t('actions.createItem', { defaultValue: 'Yangi mahsulot' })}
                  </Button>
                ) : null}
              </Stack>

              <Stack direction={{ xs: 'column', xl: 'row' }} spacing={1.5} sx={{ mt: 2.5 }}>
                <TextField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  fullWidth
                  placeholder={t('filters.searchItemsPlaceholder')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="solar:magnifer-linear" width={18} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={t('filters.all')}
                    variant={itemStatusFilter === 'all' ? 'filled' : 'outlined'}
                    color={itemStatusFilter === 'all' ? 'primary' : 'default'}
                    onClick={() => setItemStatusFilter('all')}
                    sx={filterChipSx}
                  />
                  <Chip
                    label={t('actions.activeOnly', { defaultValue: 'Faqat faol' })}
                    variant={itemStatusFilter === 'active' ? 'filled' : 'outlined'}
                    color={itemStatusFilter === 'active' ? 'primary' : 'default'}
                    onClick={() => setItemStatusFilter('active')}
                    sx={filterChipSx}
                  />
                  <Chip
                    label={t('actions.inactiveOnly', { defaultValue: 'Nofaol' })}
                    variant={itemStatusFilter === 'inactive' ? 'filled' : 'outlined'}
                    color={itemStatusFilter === 'inactive' ? 'primary' : 'default'}
                    onClick={() => setItemStatusFilter('inactive')}
                    sx={filterChipSx}
                  />
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={t('filters.all')}
                    variant={stoplistFilter === 'all' ? 'filled' : 'outlined'}
                    color={stoplistFilter === 'all' ? 'primary' : 'default'}
                    onClick={() => setStoplistFilter('all')}
                    sx={filterChipSx}
                  />
                  <Chip
                    label={t('labels.available')}
                    variant={stoplistFilter === 'available' ? 'filled' : 'outlined'}
                    color={stoplistFilter === 'available' ? 'primary' : 'default'}
                    onClick={() => setStoplistFilter('available')}
                    sx={filterChipSx}
                  />
                  <Chip
                    label={t('labels.stoplisted')}
                    variant={stoplistFilter === 'stoplisted' ? 'filled' : 'outlined'}
                    color={stoplistFilter === 'stoplisted' ? 'primary' : 'default'}
                    onClick={() => setStoplistFilter('stoplisted')}
                    sx={filterChipSx}
                  />
                </Stack>
              </Stack>
            </Box>

            <Divider />

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
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
                    gap: 2,
                  }}>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} variant="rounded" height={208} />
                  ))}
                </Box>
              ) : items.length ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
                    gap: 2,
                  }}>
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </Box>
              ) : (
                <EmptyContent
                  filled
                  title={normalizedSearch || itemStatusFilter !== 'all' || stoplistFilter !== 'all'
                    ? t('empty.items.noResults.title')
                    : t('empty.items.noData.title')}
                  description={normalizedSearch || itemStatusFilter !== 'all' || stoplistFilter !== 'all'
                    ? t('empty.items.noResults.description')
                    : t('empty.items.noData.description')}
                  action={
                    selectedCategory ? (
                      <Button
                        component={RouterLink}
                        href={RoutePath.catalogItemCreate}
                        variant="contained"
                        color="black"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        disabled={isCreateItemDisabled}
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
    </ListPageContent>
  );
};

export default CatalogBrowserPage;
