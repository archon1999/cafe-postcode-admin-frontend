import type { ReactNode } from 'react';

import { Content, ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';

type MyRestaurantSectionLayoutProps = {
  heading: string;
  children: ReactNode;
  action?: ReactNode;
  listPage?: boolean;
};

export function MyRestaurantSectionLayout({
  heading,
  children,
  action,
  listPage = false,
}: MyRestaurantSectionLayoutProps) {
  const { t } = useTranslate('organizations');
  const rootTitle = t('pages.myRestaurant.title', { defaultValue: 'Mening restoranim' });
  const Layout = listPage ? ListPageContent : Content;
  const content = listPage ? <ListPageBody>{children}</ListPageBody> : children;

  return (
    <Layout>
      <CustomBreadcrumbs
        heading={heading}
        action={action}
        links={
          heading === rootTitle
            ? [{ name: rootTitle }]
            : [{ name: rootTitle, href: RoutePath.organizationMyRestaurantGeneral }, { name: heading }]
        }
      />
      {content}
    </Layout>
  );
}
