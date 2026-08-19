import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router';

import { AdminAuthOverlays } from 'modules/auth/ui/components/AdminAuthOverlays';

import { getTitleNamespaces, resolvePageTitle } from '../config/page-title';

export function RouteMetadataLayout() {
  const { pathname } = useLocation();
  const { i18n, t } = useTranslation();

  useEffect(() => {
    let active = true;

    const updateTitle = async () => {
      const namespaces = getTitleNamespaces(pathname);

      if (namespaces.length) {
        await i18n.loadNamespaces(namespaces);
      }

      if (active) {
        document.title = resolvePageTitle(pathname, t);
      }
    };

    void updateTitle();

    return () => {
      active = false;
    };
  }, [i18n, i18n.resolvedLanguage, pathname, t]);

  return (
    <>
      <AdminAuthOverlays />
      <Outlet />
    </>
  );
}
