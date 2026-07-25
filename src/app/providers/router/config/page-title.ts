import i18next from 'i18next';
import type { TFunction } from 'i18next';
import { matchPath } from 'react-router';
import type { Params } from 'react-router';

import { CONFIG } from 'app/config/globalConfig';
import { AppRoutes, RoutePath } from 'app/routes';
import { DEFAULT_REPORT_KEY } from 'modules/restaurant-admin/reports/domain';

type RouteParams = Params<string>;
type TitleRule = {
  route: AppRoutes;
  namespaces: string[];
  resolve: (params: RouteParams, t: TFunction) => string[];
};

const getEntityDetailsTitle = (t: TFunction): string => t('common:labels.details');
const getReportTitle = (t: TFunction, reportKey?: string): string => {
  const reportTitles: Record<string, string> = {
    summary: t('reports:reports.summary.title'),
    sales: t('reports:reports.sales.title'),
    receipts: t('reports:reports.receipts.title'),
    topItems: t('reports:reports.topItems.title'),
    topStaff: t('reports:reports.topStaff.title'),
    paymentBreakdown: t('reports:reports.paymentBreakdown.title'),
    shifts: t('reports:reports.shifts.title'),
  };

  return reportTitles[reportKey ?? 'summary'] ?? t('reports:workspace.title');
};

const TITLE_RULES: TitleRule[] = [
  { route: AppRoutes.LOGIN, namespaces: ['auth'], resolve: (_params, t) => [t('auth:login.pageTitle')] },
  { route: AppRoutes.MAIN, namespaces: [], resolve: () => [] },
  {
    route: AppRoutes.PLATFORM_BUSINESS_PARTNER_LIST,
    namespaces: ['platform'],
    resolve: (_params, t) => [t('platform:pages.businessPartners.title')],
  },
  {
    route: AppRoutes.PLATFORM_BUSINESS_PARTNER_CREATE,
    namespaces: ['platform'],
    resolve: (_params, t) => [
      t('platform:pages.businessPartners.title'),
      t('platform:pages.businessPartnerCreate.title'),
    ],
  },
  {
    route: AppRoutes.PLATFORM_BUSINESS_PARTNER_EDIT,
    namespaces: ['platform', 'common'],
    resolve: (_params, t) => [
      t('platform:pages.businessPartners.title'),
      getEntityDetailsTitle(t),
      t('platform:pages.businessPartnerEdit.title'),
    ],
  },
  {
    route: AppRoutes.PLATFORM_TARIFF_LIST,
    namespaces: ['platform'],
    resolve: (_params, t) => [t('platform:pages.tariffs.title')],
  },
  {
    route: AppRoutes.PLATFORM_TARIFF_CREATE,
    namespaces: ['platform'],
    resolve: (_params, t) => [t('platform:pages.tariffs.title'), t('platform:pages.tariffCreate.title')],
  },
  {
    route: AppRoutes.PLATFORM_TARIFF_EDIT,
    namespaces: ['platform', 'common'],
    resolve: (_params, t) => [
      t('platform:pages.tariffs.title'),
      getEntityDetailsTitle(t),
      t('platform:pages.tariffEdit.title'),
    ],
  },
  { route: AppRoutes.USER_LIST, namespaces: ['users'], resolve: (_params, t) => [t('users:pages.list.title')] },
  {
    route: AppRoutes.EMPLOYEE_LIST,
    namespaces: ['users'],
    resolve: (_params, t) => [t('users:pages.employeeList.title')],
  },
  {
    route: AppRoutes.ORGANIZATION_MY_RESTAURANT,
    namespaces: ['organizations'],
    resolve: (_params, t) => [t('organizations:pages.myRestaurant.title')],
  },
  {
    route: AppRoutes.ORGANIZATION_MY_RESTAURANT_SETUP,
    namespaces: ['organizations'],
    resolve: (_params, t) => [t('organizations:pages.myRestaurant.title'), t('organizations:pages.setup.title')],
  },
  {
    route: AppRoutes.ORGANIZATION_MY_RESTAURANT_GENERAL,
    namespaces: ['organizations'],
    resolve: (_params, t) => [
      t('organizations:pages.myRestaurant.title'),
      t('organizations:pages.myRestaurantGeneral.title'),
    ],
  },
  {
    route: AppRoutes.ORGANIZATION_MY_RESTAURANT_CASH_DESK_LIST,
    namespaces: ['organizations'],
    resolve: (_params, t) => [t('organizations:pages.myRestaurant.title'), t('organizations:pages.cashDesks.title')],
  },
  {
    route: AppRoutes.ORGANIZATION_MY_RESTAURANT_PREP_STATION_LIST,
    namespaces: ['organizations'],
    resolve: (_params, t) => [t('organizations:pages.myRestaurant.title'), t('organizations:pages.prepStations.title')],
  },
  {
    route: AppRoutes.ORGANIZATION_MY_RESTAURANT_INTEGRATION_CONFIG_LIST,
    namespaces: ['organizations'],
    resolve: (_params, t) => [t('organizations:pages.myRestaurant.title'), t('organizations:pages.integrations.title')],
  },
  {
    route: AppRoutes.ORGANIZATION_MY_RESTAURANT_PRINT_TEMPLATE_LIST,
    namespaces: ['printing'],
    resolve: (_params, t) => [t('printing:title')],
  },
  {
    route: AppRoutes.REPORTS,
    namespaces: ['reports'],
    resolve: (_params, t) => [t('reports:workspace.title'), getReportTitle(t, DEFAULT_REPORT_KEY)],
  },
  {
    route: AppRoutes.REPORT_DETAIL,
    namespaces: ['reports'],
    resolve: ({ reportKey }, t) => [t('reports:workspace.title'), getReportTitle(t, reportKey)],
  },
  { route: AppRoutes.EXPENSES, namespaces: ['expenses'], resolve: (_params, t) => [t('expenses:title')] },
  {
    route: AppRoutes.ORDER_ITEM_NOTE_VIEW,
    namespaces: ['orders'],
    resolve: (_params, t) => [t('orders:pages.orderItemNotes.title'), t('orders:pages.orderItemNoteDetail.title')],
  },
  {
    route: AppRoutes.ORDER_ITEM_NOTE_LIST,
    namespaces: ['orders'],
    resolve: (_params, t) => [t('orders:pages.orderItemNotes.title')],
  },
  {
    route: AppRoutes.ORDER_ITEM_VIEW,
    namespaces: ['orders', 'common'],
    resolve: (_params, t) => [t('orders:pages.orderItems.title'), getEntityDetailsTitle(t)],
  },
  {
    route: AppRoutes.ORDER_ITEM_LIST,
    namespaces: ['orders'],
    resolve: (_params, t) => [t('orders:pages.orderItems.title')],
  },
  { route: AppRoutes.ORDER_LIST, namespaces: ['orders'], resolve: (_params, t) => [t('orders:pages.orders.title')] },
  {
    route: AppRoutes.ORDER_VIEW,
    namespaces: ['orders', 'common'],
    resolve: (_params, t) => [t('orders:pages.orders.title'), getEntityDetailsTitle(t)],
  },
  {
    route: AppRoutes.PAYMENT_LIST,
    namespaces: ['orders'],
    resolve: (_params, t) => [t('orders:pages.payments.title')],
  },
  {
    route: AppRoutes.PAYMENT_VIEW,
    namespaces: ['orders', 'common'],
    resolve: (_params, t) => [t('orders:pages.payments.title'), getEntityDetailsTitle(t)],
  },
  {
    route: AppRoutes.RECEIPT_LIST,
    namespaces: ['orders'],
    resolve: (_params, t) => [t('orders:pages.receipts.title')],
  },
  {
    route: AppRoutes.RECEIPT_VIEW,
    namespaces: ['orders', 'common'],
    resolve: (_params, t) => [t('orders:pages.receipts.title'), getEntityDetailsTitle(t)],
  },
  {
    route: AppRoutes.KITCHEN_TICKET_LIST,
    namespaces: ['kitchen'],
    resolve: (_params, t) => [t('kitchen:pages.list.title')],
  },
  {
    route: AppRoutes.KITCHEN_TICKET_VIEW,
    namespaces: ['kitchen', 'common'],
    resolve: (_params, t) => [t('kitchen:pages.list.title'), getEntityDetailsTitle(t)],
  },
  {
    route: AppRoutes.CATALOG_BROWSER,
    namespaces: ['catalog'],
    resolve: (_params, t) => [t('catalog:pages.browser.title')],
  },
  {
    route: AppRoutes.CATALOG_CATEGORY_LIST,
    namespaces: ['catalog'],
    resolve: (_params, t) => [t('catalog:pages.categories.title')],
  },
  {
    route: AppRoutes.CATALOG_CATEGORY_CREATE,
    namespaces: ['catalog'],
    resolve: (_params, t) => [t('catalog:pages.categories.title'), t('catalog:pages.categoryCreate.title')],
  },
  {
    route: AppRoutes.CATALOG_CATEGORY_EDIT,
    namespaces: ['catalog'],
    resolve: (_params, t) => [t('catalog:pages.categories.title'), t('catalog:pages.categoryEdit.title')],
  },
  {
    route: AppRoutes.CATALOG_ITEM_LIST,
    namespaces: ['catalog'],
    resolve: (_params, t) => [t('catalog:pages.items.title')],
  },
  {
    route: AppRoutes.CATALOG_ITEM_CREATE,
    namespaces: ['catalog'],
    resolve: (_params, t) => [t('catalog:pages.items.title'), t('catalog:pages.itemCreate.title')],
  },
  {
    route: AppRoutes.CATALOG_ITEM_EDIT,
    namespaces: ['catalog'],
    resolve: (_params, t) => [t('catalog:pages.items.title'), t('catalog:pages.itemEdit.title')],
  },
  {
    route: AppRoutes.CATALOG_MODIFIER_GROUP_LIST,
    namespaces: ['catalog'],
    resolve: (_params, t) => [t('catalog:modifiers.title', { defaultValue: 'Xususiyat guruhlari' })],
  },
  {
    route: AppRoutes.USER_CREATE,
    namespaces: ['users'],
    resolve: (_params, t) => [t('users:pages.list.title'), t('users:actions.create')],
  },
  {
    route: AppRoutes.EMPLOYEE_CREATE,
    namespaces: ['users'],
    resolve: (_params, t) => [t('users:pages.employeeList.title'), t('users:actions.createEmployee')],
  },
  {
    route: AppRoutes.USER_EDIT,
    namespaces: ['users', 'common'],
    resolve: (_params, t) => [t('users:pages.list.title'), getEntityDetailsTitle(t), t('users:actions.edit')],
  },
  {
    route: AppRoutes.EMPLOYEE_EDIT,
    namespaces: ['users', 'common'],
    resolve: (_params, t) => [t('users:pages.employeeList.title'), getEntityDetailsTitle(t), t('users:actions.edit')],
  },
  {
    route: AppRoutes.USER_VIEW,
    namespaces: ['users', 'common'],
    resolve: (_params, t) => [t('users:pages.list.title'), getEntityDetailsTitle(t)],
  },
  {
    route: AppRoutes.EMPLOYEE_VIEW,
    namespaces: ['users', 'common'],
    resolve: (_params, t) => [t('users:pages.employeeList.title'), getEntityDetailsTitle(t)],
  },
  { route: AppRoutes.FLOOR_ZONE_LIST, namespaces: ['floor'], resolve: (_params, t) => [t('floor:pages.zones.title')] },
  { route: AppRoutes.FLOOR_HALL_LIST, namespaces: ['floor'], resolve: (_params, t) => [t('floor:pages.halls.title')] },
  {
    route: AppRoutes.FLOOR_HALL_CONSTRUCTOR,
    namespaces: ['floor'],
    resolve: (_params, t) => [t('floor:pages.halls.title'), t('floor:pages.hallConstructor.title')],
  },
  {
    route: AppRoutes.FLOOR_HALL_CREATE,
    namespaces: ['floor'],
    resolve: (_params, t) => [t('floor:pages.halls.title'), t('floor:pages.hallCreate.title')],
  },
  {
    route: AppRoutes.FLOOR_HALL_EDIT,
    namespaces: ['floor'],
    resolve: (_params, t) => [t('floor:pages.halls.title'), t('floor:pages.hallEdit.title')],
  },
  {
    route: AppRoutes.FLOOR_ZONE_CREATE,
    namespaces: ['floor'],
    resolve: (_params, t) => [t('floor:pages.zones.title'), t('floor:pages.zoneCreate.title')],
  },
  {
    route: AppRoutes.FLOOR_ZONE_EDIT,
    namespaces: ['floor', 'common'],
    resolve: (_params, t) => [t('floor:pages.zones.title'), getEntityDetailsTitle(t), t('floor:pages.zoneEdit.title')],
  },
  {
    route: AppRoutes.FLOOR_TABLE_SESSION_LIST,
    namespaces: ['floor'],
    resolve: (_params, t) => [t('floor:pages.tableSessions.title')],
  },
  {
    route: AppRoutes.FLOOR_TABLE_SESSION_CREATE,
    namespaces: ['floor'],
    resolve: (_params, t) => [t('floor:pages.tableSessions.title'), t('floor:pages.tableSessionCreate.title')],
  },
  {
    route: AppRoutes.FLOOR_TABLE_SESSION_EDIT,
    namespaces: ['floor'],
    resolve: (_params, t) => [t('floor:pages.tableSessions.title'), t('floor:pages.tableSessionEdit.title')],
  },
  { route: AppRoutes.NOTFOUND, namespaces: ['common'], resolve: (_params, t) => [t('common:labels.notFound')] },
];

const buildPageTitle = (parts: string[]): string => {
  if (parts.length === 0) {
    return CONFIG.appName;
  }

  return `${parts.join(' - ')} - ${CONFIG.appName}`;
};

const isKnownRoute = (pathname: string) =>
  Object.entries(RoutePath).some(
    ([route, path]) => route !== AppRoutes.NOTFOUND && Boolean(matchPath({ path, end: true }, pathname)),
  );

const getMatchedTitleRule = (pathname: string) => {
  for (const rule of TITLE_RULES) {
    if (rule.route === AppRoutes.NOTFOUND) {
      continue;
    }

    const matched = matchPath({ path: RoutePath[rule.route], end: true }, pathname);

    if (matched) {
      return { rule, params: matched.params };
    }
  }

  return null;
};

export const getTitleNamespaces = (pathname: string): string[] => {
  const matched = getMatchedTitleRule(pathname);

  if (matched) {
    return matched.rule.namespaces;
  }

  return isKnownRoute(pathname) ? [] : ['common'];
};

export const resolvePageTitle = (pathname: string, t: TFunction = i18next.t.bind(i18next)): string => {
  const matched = getMatchedTitleRule(pathname);

  if (matched) {
    return buildPageTitle(matched.rule.resolve(matched.params, t));
  }

  if (isKnownRoute(pathname)) {
    return CONFIG.appName;
  }

  return buildPageTitle([t('common:labels.notFound')]);
};
