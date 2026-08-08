import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState, type DragEvent } from 'react';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useAdminRestaurantScopeId } from 'modules/auth';
import type { CatalogCategory, CatalogItem, CatalogItemGroup } from 'shared/api/admin-types';
import { EmptyContent } from 'shared/ui/EmptyContent';
import { Iconify } from 'shared/ui/Iconify';
import { SortableGrid } from 'shared/ui/SortableGrid';

import { CatalogBrowserProductCard } from './CatalogBrowserProductCard';

type CatalogBrowserProductsPanelProps = {
  selectedCategory: CatalogCategory | null;
  selectedCategoryId: string | null;
  products: CatalogItem[];
  itemGroups: CatalogItemGroup[];
  selectedProductIds: Set<string>;
  isLoading: boolean;
  isRefreshing: boolean;
  onCreateProduct: () => void;
  onEditProduct: (product: CatalogItem) => void;
  onToggleProduct: (product: CatalogItem) => void;
  onClearSelection: () => void;
  onCreateGroup: () => void;
  onEditGroup: (group: CatalogItemGroup) => void;
  onAddProductToGroup: (group: CatalogItemGroup, product: CatalogItem) => Promise<unknown>;
  onRemoveProductFromGroup: (group: CatalogItemGroup, product: CatalogItem) => Promise<unknown>;
  isUpdatingGroup: boolean;
  isReordering: boolean;
  onReorder: (products: CatalogItem[]) => Promise<unknown>;
};

export function CatalogBrowserProductsPanel({
  selectedCategory,
  selectedCategoryId,
  products,
  itemGroups,
  selectedProductIds,
  isLoading,
  isRefreshing,
  onCreateProduct,
  onEditProduct,
  onToggleProduct,
  onClearSelection,
  onCreateGroup,
  onEditGroup,
  onAddProductToGroup,
  onRemoveProductFromGroup,
  isUpdatingGroup,
  isReordering,
  onReorder,
}: CatalogBrowserProductsPanelProps) {
  const { t } = useTranslate('catalog');
  const restaurantId = useAdminRestaurantScopeId();
  const { disabled: isCreateProductDisabled } = useAdminCreateAccess(RoutePath.catalogItemCreate);
  const [dropTargetGroupId, setDropTargetGroupId] = useState<string | null>(null);
  const groupedProductIds = new Set(itemGroups.flatMap((group) => group.members.map((member) => member.catalogItem)));
  const ungroupedProducts = products.filter((product) => !groupedProductIds.has(product.id));
  const productsById = new Map(products.map((product) => [product.id, product]));

  const dropProductIntoGroup = (event: DragEvent<HTMLElement>, group: CatalogItemGroup) => {
    event.preventDefault();
    event.stopPropagation();
    setDropTargetGroupId(null);
    const product = productsById.get(event.dataTransfer.getData('text/plain'));
    if (!product || groupedProductIds.has(product.id) || isUpdatingGroup) return;
    void onAddProductToGroup(group, product);
  };

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden', borderRadius: 0 }}>
      {isRefreshing ? <LinearProgress /> : null}

      <Box sx={{ px: 2.5, py: 2.25, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Typography variant="h6">{t('pages.items.title')}</Typography>
            {selectedProductIds.size ? (
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.65}
                sx={{ px: 1.1, py: 0.55, borderRadius: 1.25, bgcolor: 'background.neutral' }}>
                <Iconify icon="solar:check-circle-bold" width={18} color="primary.main" />
                <Typography variant="body2" fontWeight={700}>
                  {t('itemGroups.selectionCount', { count: selectedProductIds.size })}
                </Typography>
              </Stack>
            ) : null}
          </Stack>

          {selectedProductIds.size ? (
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Button size="small" color="inherit" onClick={onClearSelection}>
                {t('itemGroups.clearSelection')}
              </Button>
              <Button size="small" variant="contained" disabled={selectedProductIds.size < 2} onClick={onCreateGroup}>
                {t('itemGroups.groupAction')}
              </Button>
            </Stack>
          ) : (
            <Button
              variant="contained"
              color="black"
              startIcon={<Iconify icon="mingcute:add-line" />}
              disabled={isCreateProductDisabled || !selectedCategory}
              onClick={onCreateProduct}>
              {t('actions.createItem')}
            </Button>
          )}
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
          <Stack spacing={3}>
            {itemGroups.length ? (
              <Stack spacing={1.25}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Iconify icon="solar:widget-5-bold-duotone" width={22} />
                  <Typography variant="subtitle1">{t('itemGroups.groupedTitle')}</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {itemGroups.map((group) => (
                    <Box
                      key={group.id}
                      onDragEnter={() => setDropTargetGroupId(group.id)}
                      onDragLeave={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
                          setDropTargetGroupId(null);
                      }}
                      onDragOver={(event) => {
                        if (!isUpdatingGroup) {
                          event.preventDefault();
                          event.dataTransfer.dropEffect = 'move';
                        }
                      }}
                      onDrop={(event) => dropProductIntoGroup(event, group)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'background.neutral',
                        outline: dropTargetGroupId === group.id ? '2px solid' : '1px solid transparent',
                        outlineColor: dropTargetGroupId === group.id ? 'primary.main' : 'transparent',
                        transition: 'outline-color 140ms ease, background-color 140ms ease',
                      }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 0.5, mb: 1.25 }}>
                        <Typography variant="subtitle1">{group.name}</Typography>
                        <IconButton
                          aria-label={t('itemGroups.editTitle')}
                          onClick={() => onEditGroup(group)}
                          sx={{ ml: 'auto !important' }}>
                          <Iconify icon="solar:pen-bold" width={18} />
                        </IconButton>
                      </Stack>
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
                        {group.members.map((member) => {
                          const product = productsById.get(member.catalogItem);
                          return product ? (
                            <CatalogBrowserProductCard
                              key={member.id}
                              product={product}
                              onEdit={onEditProduct}
                              onRemoveFromGroup={(item) => void onRemoveProductFromGroup(group, item)}
                            />
                          ) : null;
                        })}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            ) : null}

            <Stack spacing={1.25}>
              {itemGroups.length ? (
                <Typography variant="subtitle1">{t('itemGroups.standaloneTitle')}</Typography>
              ) : null}
              {ungroupedProducts.length ? (
                <SortableGrid
                  items={ungroupedProducts}
                  gridTemplateColumns={{
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    xl: 'repeat(4, minmax(0, 1fr))',
                  }}
                  gap={2}
                  dragLabel={t('labels.dragToReorder')}
                  disabled={isReordering || !restaurantId}
                  onReorder={onReorder}
                  renderItem={(product) => (
                    <CatalogBrowserProductCard
                      product={product}
                      onEdit={onEditProduct}
                      selected={selectedProductIds.has(product.id)}
                      onToggleSelect={onToggleProduct}
                    />
                  )}
                />
              ) : (
                <Typography color="text.secondary">{t('itemGroups.allGrouped')}</Typography>
              )}
            </Stack>
          </Stack>
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
