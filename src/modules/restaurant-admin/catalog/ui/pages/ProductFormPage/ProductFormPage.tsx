import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { useGetCatalogItemByIdQuery } from '../../../application';
import { CatalogItemFormCard } from '../../components/CatalogItemForm';

const ProductFormPage = () => {
  const { t } = useTranslate('catalog');
  const { id } = useParams<{ id: string }>();
  const { push } = useRouter();
  const isEditMode = Boolean(id);

  const itemQuery = useGetCatalogItemByIdQuery(id ?? '', { enabled: isEditMode });

  useRedirectOnNotFound(itemQuery.error, isEditMode);

  if (isEditMode && itemQuery.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Content>
      <CustomBreadcrumbs
        heading={
          isEditMode
            ? t('pages.itemEdit.title', { defaultValue: 'Mahsulotni tahrirlash' })
            : t('pages.itemCreate.title', { defaultValue: 'Yangi mahsulot' })
        }
        links={[
          { name: t('pages.items.title'), href: RoutePath.catalogItemList },
          {
            name: isEditMode
              ? t('pages.itemEdit.title', { defaultValue: 'Mahsulotni tahrirlash' })
              : t('pages.itemCreate.title', { defaultValue: 'Yangi mahsulot' }),
          },
        ]}
      />

      <CatalogItemFormCard
        item={itemQuery.data}
        onCancel={() => push(RoutePath.catalogItemList)}
        onSuccess={() => push(RoutePath.catalogItemList)}
      />
    </Content>
  );
};

export default ProductFormPage;
