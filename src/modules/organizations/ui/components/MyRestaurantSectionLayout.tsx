import type { ReactNode } from 'react';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';

type MyRestaurantSectionLayoutProps = {
  heading: string;
  children: ReactNode;
};

export function MyRestaurantSectionLayout({ heading, children }: MyRestaurantSectionLayoutProps) {
  const { t } = useTranslate('organizations');
  const rootTitle = t('pages.myRestaurant.title', { defaultValue: 'Mening restoranim' });

  return (
    <Content>
      <CustomBreadcrumbs
        heading={heading}
        links={
          heading === rootTitle
            ? [{ name: rootTitle }]
            : [{ name: rootTitle, href: RoutePath.organizationMyRestaurantGeneral }, { name: heading }]
        }
      />
      {children}
    </Content>
  );
}
