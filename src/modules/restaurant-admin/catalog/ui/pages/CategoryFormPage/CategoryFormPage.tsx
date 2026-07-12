import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { BackToListButton } from 'shared/ui/BackToListButton';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { useGetCatalogCategoryByIdQuery } from '../../../application';
import { CatalogCategoryFormCard } from '../../components/CatalogCategoryForm';

const CategoryFormPage = () => {
  const { t } = useTranslate('catalog');
  const { id } = useParams<{ id: string }>();
  const { push } = useRouter();
  const isEditMode = Boolean(id);

  const categoryQuery = useGetCatalogCategoryByIdQuery(id ?? '', { enabled: isEditMode });

  useRedirectOnNotFound(categoryQuery.error, isEditMode);

  if (isEditMode && categoryQuery.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Content>
      <CustomBreadcrumbs
        heading={isEditMode ? t('pages.categoryEdit.title') : t('pages.categoryCreate.title')}
        action={isEditMode ? <BackToListButton href={RoutePath.catalogCategoryList} /> : undefined}
      />

      <CatalogCategoryFormCard
        category={categoryQuery.data}
        onCancel={() => push(RoutePath.catalogCategoryList)}
        onSuccess={() => push(RoutePath.catalogCategoryList)}
      />
    </Content>
  );
};

export default CategoryFormPage;
