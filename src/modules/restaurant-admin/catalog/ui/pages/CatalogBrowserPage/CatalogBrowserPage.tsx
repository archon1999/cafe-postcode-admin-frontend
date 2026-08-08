import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import { useEffect, useMemo, useState } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import type { CatalogCategory, CatalogItem, CatalogItemGroup } from 'shared/api/admin-types';

import {
  useGetCatalogCategoriesListQuery,
  useGetCatalogItemsListQuery,
  useGetCatalogItemGroupsQuery,
  useDeleteCatalogItemGroupMutation,
  useReorderCatalogCategoriesMutation,
  useReorderCatalogItemsMutation,
  useSaveCatalogItemGroupMutation,
} from '../../../application';
import { CatalogCategoryFormDialog } from '../../components/CatalogCategoryForm';
import { CatalogItemFormDialog } from '../../components/CatalogItemForm';
import { CatalogItemGroupDialog } from '../../components/CatalogItemGroupDialog';

import { CatalogBrowserCategoriesPanel } from './CatalogBrowserCategoriesPanel';
import { CatalogBrowserProductsPanel } from './CatalogBrowserProductsPanel';

const CATEGORY_PAGE_SIZE = 500;
const PRODUCT_PAGE_SIZE = 500;

const CatalogBrowserPage = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCategoryCreateOpen, setCategoryCreateOpen] = useState(false);
  const [isCategoryEditOpen, setCategoryEditOpen] = useState(false);
  const [isProductCreateOpen, setProductCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogItem | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [isGroupCreateOpen, setGroupCreateOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CatalogItemGroup | null>(null);
  const reorderCategoriesMutation = useReorderCatalogCategoriesMutation();
  const reorderItemsMutation = useReorderCatalogItemsMutation();
  const saveItemGroupMutation = useSaveCatalogItemGroupMutation();
  const deleteItemGroupMutation = useDeleteCatalogItemGroupMutation();

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

  const productsQuery = useGetCatalogItemsListQuery(
    {
      page: 1,
      pageSize: PRODUCT_PAGE_SIZE,
      categoryIdIn: selectedCategoryId ?? undefined,
      ordering: 'sortOrder,name',
    },
    { enabled: Boolean(selectedCategoryId) },
  );
  const products = useMemo(() => productsQuery.data?.data ?? [], [productsQuery.data]);
  const itemGroupsQuery = useGetCatalogItemGroupsQuery(selectedCategoryId ?? undefined);
  const itemGroups = useMemo(() => itemGroupsQuery.data ?? [], [itemGroupsQuery.data]);
  const isProductsLoading = productsQuery.isLoading && !products.length;
  const isRefreshingProducts = productsQuery.isFetching && !isProductsLoading;

  const reorderCategories = (nextCategories: CatalogCategory[]) =>
    reorderCategoriesMutation.mutateAsync(
      nextCategories.map((category, sortOrder) => ({ id: category.id, sortOrder })),
    );

  const reorderProducts = (nextProducts: CatalogItem[]) =>
    reorderItemsMutation.mutateAsync(nextProducts.map((product, sortOrder) => ({ id: product.id, sortOrder })));

  useEffect(() => {
    setSelectedProductIds(new Set());
    setGroupCreateOpen(false);
    setEditingGroup(null);
  }, [selectedCategoryId]);

  const selectedProducts = products.filter((product) => selectedProductIds.has(product.id));

  const addProductToGroup = async (group: CatalogItemGroup, product: CatalogItem) => {
    await saveItemGroupMutation.mutateAsync({
      id: group.id,
      payload: groupPayload(group, [
        ...group.members.map((member) => ({
          catalogItem: member.catalogItem,
          variantName: member.variantName,
        })),
        { catalogItem: product.id, variantName: inferVariantName(product.name) },
      ]),
    });
    setSelectedProductIds((current) => {
      const next = new Set(current);
      next.delete(product.id);
      return next;
    });
  };

  const removeProductFromGroup = async (group: CatalogItemGroup, product: CatalogItem) => {
    const members = group.members
      .filter((member) => member.catalogItem !== product.id)
      .map((member) => ({ catalogItem: member.catalogItem, variantName: member.variantName }));
    if (members.length < 2) await deleteItemGroupMutation.mutateAsync(group.id);
    else await saveItemGroupMutation.mutateAsync({ id: group.id, payload: groupPayload(group, members) });
  };

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
          <CatalogBrowserCategoriesPanel
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            isLoading={categoriesQuery.isLoading && !categories.length}
            onSelectCategory={setSelectedCategoryId}
            onCreateCategory={() => setCategoryCreateOpen(true)}
            onEditCategory={() => setCategoryEditOpen(true)}
            canEditCategory={Boolean(selectedCategory)}
            isReordering={reorderCategoriesMutation.isPending}
            onReorder={reorderCategories}
          />

          <CatalogBrowserProductsPanel
            selectedCategory={selectedCategory}
            selectedCategoryId={selectedCategoryId}
            products={products}
            itemGroups={itemGroups}
            selectedProductIds={selectedProductIds}
            isLoading={isProductsLoading}
            isRefreshing={isRefreshingProducts}
            onCreateProduct={() => setProductCreateOpen(true)}
            onEditProduct={setEditingProduct}
            onToggleProduct={(product) =>
              setSelectedProductIds((current) => {
                const next = new Set(current);
                if (next.has(product.id)) next.delete(product.id);
                else next.add(product.id);
                return next;
              })
            }
            onClearSelection={() => setSelectedProductIds(new Set())}
            onCreateGroup={() => setGroupCreateOpen(true)}
            onEditGroup={setEditingGroup}
            onAddProductToGroup={addProductToGroup}
            onRemoveProductFromGroup={removeProductFromGroup}
            isUpdatingGroup={saveItemGroupMutation.isPending || deleteItemGroupMutation.isPending}
            isReordering={reorderItemsMutation.isPending}
            onReorder={reorderProducts}
          />
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
          onDeleted={() => {
            setCategoryEditOpen(false);
            setSelectedCategoryId(null);
          }}
        />
      </Dialog>

      <Dialog open={isProductCreateOpen} onClose={() => setProductCreateOpen(false)} maxWidth="md" fullWidth>
        <CatalogItemFormDialog
          defaultCategoryId={selectedCategoryId}
          onCancel={() => setProductCreateOpen(false)}
          onSuccess={() => setProductCreateOpen(false)}
        />
      </Dialog>

      <Dialog open={Boolean(editingProduct)} onClose={() => setEditingProduct(null)} maxWidth="md" fullWidth>
        <CatalogItemFormDialog
          item={editingProduct}
          onCancel={() => setEditingProduct(null)}
          onSuccess={() => setEditingProduct(null)}
          onDeleted={() => setEditingProduct(null)}
        />
      </Dialog>

      <Dialog open={isGroupCreateOpen} onClose={() => setGroupCreateOpen(false)} maxWidth="sm" fullWidth>
        {selectedCategoryId ? (
          <CatalogItemGroupDialog
            categoryId={selectedCategoryId}
            products={selectedProducts}
            onCancel={() => setGroupCreateOpen(false)}
            onSuccess={() => {
              setGroupCreateOpen(false);
              setSelectedProductIds(new Set());
            }}
          />
        ) : null}
      </Dialog>

      <Dialog open={Boolean(editingGroup)} onClose={() => setEditingGroup(null)} maxWidth="sm" fullWidth>
        {selectedCategoryId && editingGroup ? (
          <CatalogItemGroupDialog
            categoryId={selectedCategoryId}
            group={editingGroup}
            products={products}
            onCancel={() => setEditingGroup(null)}
            onSuccess={() => setEditingGroup(null)}
          />
        ) : null}
      </Dialog>
    </ListPageContent>
  );
};

export default CatalogBrowserPage;

function groupPayload(group: CatalogItemGroup, members: Array<{ catalogItem: string; variantName: string }>) {
  return {
    category: group.category,
    name: group.name,
    description: group.description ?? '',
    sortOrder: group.sortOrder,
    isActive: group.isActive,
    members: members.map((member, sortOrder) => ({ ...member, sortOrder })),
  };
}

function inferVariantName(name: string) {
  return name.match(/(?:^|\s)(S|M|L|XL|\d+\s*cm)\s*$/i)?.[1]?.toUpperCase() ?? '';
}
