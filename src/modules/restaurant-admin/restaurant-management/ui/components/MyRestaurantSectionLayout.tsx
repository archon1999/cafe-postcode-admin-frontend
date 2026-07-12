import type { ReactNode } from 'react';

import { Content, ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
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
  const Layout = listPage ? ListPageContent : Content;
  const content = listPage ? <ListPageBody>{children}</ListPageBody> : children;

  return (
    <Layout>
      <CustomBreadcrumbs heading={heading} action={action} />
      {content}
    </Layout>
  );
}
