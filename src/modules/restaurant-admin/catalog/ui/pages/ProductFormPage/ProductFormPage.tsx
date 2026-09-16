import { Card, Tab, Tabs } from '@mui/material';
import { useState } from 'react';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { CatalogRecipePanel, useInventoryAccess, type CatalogOption } from 'modules/restaurant-admin/inventory';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { BackToListButton } from 'shared/ui/BackToListButton';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { useGetCatalogItemByIdQuery } from '../../../application';
import { CatalogItemFormCard } from '../../components/CatalogItemForm';

const ProductFormPage = () => {
  const { t } = useTranslate('catalog');
  const { id } = useParams<{ id: string }>();
  const { push } = useRouter();
  const isEditMode = Boolean(id);
  const [tab, setTab] = useState<'main' | 'recipe'>('main');
  const inventoryAccess = useInventoryAccess();

  const itemQuery = useGetCatalogItemByIdQuery(id ?? '', { enabled: isEditMode });

  useRedirectOnNotFound(itemQuery.error, isEditMode);

  if (isEditMode && itemQuery.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Content>
      <CustomBreadcrumbs
        heading={isEditMode ? t('pages.itemEdit.title') : t('pages.itemCreate.title')}
        action={isEditMode ? <BackToListButton href={RoutePath.catalogItemList} /> : undefined}
      />

      {isEditMode && itemQuery.data?.itemType === 'product' && inventoryAccess.canView ? (
        <Card sx={{ mb: 3, px: 2, boxShadow: (theme) => theme.customShadows.card }}>
          <Tabs value={tab} onChange={(_, value: 'main' | 'recipe') => setTab(value)}>
            <Tab value="main" label={t('tabs.main')} />
            <Tab value="recipe" label={t('tabs.recipe')} />
          </Tabs>
        </Card>
      ) : null}

      {tab === 'recipe' && itemQuery.data ? (
        <CatalogRecipePanel
          salePrice={itemQuery.data.price}
          catalogItem={
            {
              id: itemQuery.data.id,
              name: itemQuery.data.name ?? '',
              saleUnit: itemQuery.data.saleUnit ?? 'piece',
              categoryId: itemQuery.data.category ?? null,
              categoryName: itemQuery.data.categoryName ?? '',
              modifierOptions: [],
            } satisfies CatalogOption
          }
        />
      ) : (
        <CatalogItemFormCard
          item={itemQuery.data}
          onCancel={() => push(RoutePath.catalogItemList)}
          onDeleted={() => push(RoutePath.catalogItemList)}
          onSuccess={() => push(RoutePath.catalogItemList)}
        />
      )}
    </Content>
  );
};

export default ProductFormPage;
