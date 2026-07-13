import { type TFunction } from 'i18next';

import { RoutePath, canAccessAccessControl, canAccessAdminPath, type AdminAccessSnapshot } from 'app/routes';
import { Iconify } from 'shared/ui/Iconify';
import type { NavSectionProps } from 'shared/ui/NavSection';

const ICONS = {
  platform: <Iconify icon="solar:planet-bold-duotone" width={24} />,
  businessPartners: <Iconify icon="solar:users-group-two-rounded-bold-duotone" width={20} />,
  tariffs: <Iconify icon="solar:ticket-sale-bold-duotone" width={20} />,
  ordersGroup: <Iconify icon="solar:bill-list-bold-duotone" width={24} />,
  orders: <Iconify icon="solar:document-text-bold-duotone" width={20} />,
  payments: <Iconify icon="solar:card-bold-duotone" width={20} />,
  receipts: <Iconify icon="solar:document-text-bold-duotone" width={20} />,
  reports: <Iconify icon="solar:chart-square-bold-duotone" width={24} />,
  kitchen: <Iconify icon="solar:chef-hat-bold-duotone" width={24} />,
  kitchenTickets: <Iconify icon="solar:ticket-bold-duotone" width={20} />,
  catalog: <Iconify icon="solar:widget-4-bold-duotone" width={24} />,
  browser: <Iconify icon="solar:widget-2-bold-duotone" width={20} />,
  categories: <Iconify icon="solar:tag-horizontal-bold-duotone" width={20} />,
  items: <Iconify icon="solar:archive-bold-duotone" width={20} />,
  floor: <Iconify icon="solar:map-point-rotate-bold-duotone" width={24} />,
  halls: <Iconify icon="solar:home-angle-bold-duotone" width={20} />,
  zones: <Iconify icon="solar:box-bold-duotone" width={20} />,
  tableSessions: <Iconify icon="solar:calendar-search-bold-duotone" width={20} />,
  employees: <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />,
  users: <Iconify icon="solar:user-id-bold-duotone" width={20} />,
  roles: <Iconify icon="solar:shield-user-bold-duotone" width={20} />,
  permissions: <Iconify icon="solar:key-bold-duotone" width={20} />,
  organizations: <Iconify icon="solar:buildings-3-bold-duotone" width={24} />,
  restaurants: <Iconify icon="solar:city-bold-duotone" width={20} />,
  restaurantManagement: <Iconify icon="solar:settings-bold-duotone" width={20} />,
  setup: <Iconify icon="solar:checklist-minimalistic-bold-duotone" width={20} />,
  general: <Iconify icon="solar:widget-6-bold-duotone" width={20} />,
  cashDesks: <Iconify icon="solar:wallet-money-bold-duotone" width={20} />,
  prepStations: <Iconify icon="solar:chef-hat-bold-duotone" width={20} />,
  integrations: <Iconify icon="solar:plug-circle-bold-duotone" width={20} />,
  printTemplates: <Iconify icon="solar:document-text-bold-duotone" width={20} />,
  accessControl: <Iconify icon="solar:settings-bold-duotone" width={24} />,
};

type NavOptions = AdminAccessSnapshot;

export const navData = (t: TFunction, options?: NavOptions): NavSectionProps['data'] => {
  const isSuperuser = Boolean(options?.isSuperuser);
  const canAccess = (path: string) => canAccessAdminPath(path, options);

  const sections: NavSectionProps['data'] = [];
  const pushSection = (subheader: string | undefined, items: NavSectionProps['data'][number]['items']) => {
    if (!items.length) {
      return;
    }
    sections.push({ subheader, items });
  };

  const productOwnerItems = [
    canAccess(RoutePath.platformBusinessPartnerList)
      ? {
          title: t('businessPartners'),
          path: RoutePath.platformBusinessPartnerList,
          icon: ICONS.businessPartners,
        }
      : null,
    canAccess(RoutePath.platformTariffList)
      ? {
          title: t('tariffs'),
          path: RoutePath.platformTariffList,
          icon: ICONS.tariffs,
        }
      : null,
  ].filter(Boolean) as NavSectionProps['data'][number]['items'];

  pushSection(isSuperuser ? t('productOwnerSection') : undefined, productOwnerItems);

  const businessPartnerItems = [
    canAccess(RoutePath.organizationRestaurantList)
      ? {
          title: t('restaurants'),
          path: RoutePath.organizationRestaurantList,
          icon: ICONS.restaurants,
        }
      : null,
  ].filter(Boolean) as NavSectionProps['data'][number]['items'];

  pushSection(isSuperuser ? t('businessPartnerSection') : undefined, businessPartnerItems);

  const orderChildren = [
    canAccess(RoutePath.orderList)
      ? {
          title: t('orders'),
          path: RoutePath.orderList,
          icon: ICONS.orders,
        }
      : null,
    canAccess(RoutePath.paymentList)
      ? {
          title: t('payments'),
          path: RoutePath.paymentList,
          icon: ICONS.payments,
        }
      : null,
    canAccess(RoutePath.receiptList)
      ? {
          title: t('receipts'),
          path: RoutePath.receiptList,
          icon: ICONS.receipts,
        }
      : null,
    canAccess(RoutePath.kitchenTicketList)
      ? {
          title: t('kitchenTickets'),
          path: RoutePath.kitchenTicketList,
          icon: ICONS.kitchenTickets,
        }
      : null,
  ].filter(Boolean) as NavSectionProps['data'][number]['items'];

  const catalogChildren = [
    canAccess(RoutePath.catalogBrowser)
      ? {
          title: t('browser'),
          path: RoutePath.catalogBrowser,
          icon: ICONS.browser,
        }
      : null,
    canAccess(RoutePath.catalogItemList)
      ? {
          title: t('items'),
          path: RoutePath.catalogItemList,
          icon: ICONS.items,
        }
      : null,
    canAccess(RoutePath.catalogCategoryList)
      ? {
          title: t('categories'),
          path: RoutePath.catalogCategoryList,
          icon: ICONS.categories,
        }
      : null,
  ].filter(Boolean) as NavSectionProps['data'][number]['items'];

  const floorChildren = [
    canAccess(RoutePath.floorZoneList)
      ? {
          title: t('zones'),
          path: RoutePath.floorZoneList,
          icon: ICONS.zones,
        }
      : null,
    canAccess(RoutePath.floorHallList)
      ? {
          title: t('halls'),
          path: RoutePath.floorHallList,
          icon: ICONS.halls,
        }
      : null,
    canAccess(RoutePath.floorTableSessionList)
      ? {
          title: t('tableSessions'),
          path: RoutePath.floorTableSessionList,
          icon: ICONS.tableSessions,
        }
      : null,
  ].filter(Boolean) as NavSectionProps['data'][number]['items'];

  const myRestaurantSettingsItem =
    canAccess(RoutePath.organizationMyRestaurantSetup) || canAccess(RoutePath.organizationMyRestaurantGeneral)
      ? {
          title: t('myRestaurant'),
          path: canAccess(RoutePath.organizationMyRestaurantSetup)
            ? RoutePath.organizationMyRestaurantSetup
            : RoutePath.organizationMyRestaurantGeneral,
          icon: ICONS.general,
        }
      : null;

  const myRestaurantChildren = [
    canAccess(RoutePath.organizationMyRestaurantCashDeskList)
      ? {
          title: t('cashDesks'),
          path: RoutePath.organizationMyRestaurantCashDeskList,
          icon: ICONS.cashDesks,
        }
      : null,
    canAccess(RoutePath.organizationMyRestaurantPrepStationList)
      ? {
          title: t('prepStations'),
          path: RoutePath.organizationMyRestaurantPrepStationList,
          icon: ICONS.prepStations,
        }
      : null,
    canAccess(RoutePath.organizationMyRestaurantIntegrationConfigList)
      ? {
          title: t('integrations'),
          path: RoutePath.organizationMyRestaurantIntegrationConfigList,
          icon: ICONS.integrations,
        }
      : null,
    canAccess(RoutePath.organizationMyRestaurantPrintTemplateList)
      ? {
          title: t('printTemplates'),
          path: RoutePath.organizationMyRestaurantPrintTemplateList,
          icon: ICONS.printTemplates,
        }
      : null,
  ].filter(Boolean) as NavSectionProps['data'][number]['items'];

  const restaurantAdminItems = [
    myRestaurantSettingsItem,
    canAccess(RoutePath.reports)
      ? {
          title: t('reports'),
          path: RoutePath.reports,
          icon: ICONS.reports,
        }
      : null,
    canAccess(RoutePath.employeeList)
      ? {
          title: t('employees'),
          path: RoutePath.employeeList,
          icon: ICONS.employees,
        }
      : null,
    myRestaurantChildren.length
      ? {
          title: t('restaurantManagement'),
          path: myRestaurantChildren[0].path,
          icon: ICONS.restaurantManagement,
          children: myRestaurantChildren,
        }
      : null,
    catalogChildren.length
      ? {
          title: t('catalog'),
          path: catalogChildren[0].path,
          icon: ICONS.catalog,
          children: catalogChildren,
        }
      : null,
    floorChildren.length
      ? {
          title: t('floor'),
          path: floorChildren[0].path,
          icon: ICONS.floor,
          children: floorChildren,
        }
      : null,
    orderChildren.length
      ? {
          title: t('ordersGroup'),
          path: orderChildren[0].path,
          icon: ICONS.ordersGroup,
          children: orderChildren,
        }
      : null,
  ].filter(Boolean) as NavSectionProps['data'][number]['items'];

  pushSection(isSuperuser ? t('restaurantAdminSection') : undefined, restaurantAdminItems);

  const accessControlItems = [
    canAccess(RoutePath.userList)
      ? {
          title: t('users'),
          path: RoutePath.userList,
          icon: ICONS.users,
        }
      : null,
    canAccess(RoutePath.roleList)
      ? {
          title: t('roles'),
          path: RoutePath.roleList,
          icon: ICONS.roles,
        }
      : null,
    canAccess(RoutePath.permissionList)
      ? {
          title: t('permissions'),
          path: RoutePath.permissionList,
          icon: ICONS.permissions,
        }
      : null,
  ].filter(Boolean) as NavSectionProps['data'][number]['items'];

  if (isSuperuser || canAccessAccessControl(options)) {
    pushSection(isSuperuser ? t('accessControlSection') : undefined, accessControlItems);
  }

  return sections;
};
