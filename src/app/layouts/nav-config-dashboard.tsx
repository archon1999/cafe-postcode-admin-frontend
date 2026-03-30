import { type TFunction } from 'i18next';

import { RoutePath, canAccessAdminPath, canAccessMyRestaurant, type AdminAccessSnapshot } from 'app/routes';
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
  categories: <Iconify icon="solar:tag-horizontal-bold-duotone" width={20} />,
  items: <Iconify icon="solar:archive-bold-duotone" width={20} />,
  floor: <Iconify icon="solar:map-point-rotate-bold-duotone" width={24} />,
  halls: <Iconify icon="solar:home-angle-bold-duotone" width={20} />,
  tableSessions: <Iconify icon="solar:calendar-search-bold-duotone" width={20} />,
  employees: <Iconify icon="solar:users-group-rounded-bold-duotone" width={24} />,
  users: <Iconify icon="solar:user-id-bold-duotone" width={20} />,
  roles: <Iconify icon="solar:shield-user-bold-duotone" width={20} />,
  permissions: <Iconify icon="solar:key-bold-duotone" width={20} />,
  organizations: <Iconify icon="solar:buildings-3-bold-duotone" width={24} />,
  restaurants: <Iconify icon="solar:city-bold-duotone" width={20} />,
  myRestaurant: <Iconify icon="solar:buildings-bold-duotone" width={20} />,
};

type NavOptions = AdminAccessSnapshot;

export const navData = (t: TFunction, options?: NavOptions): NavSectionProps['data'] => {
  const isSuperuser = Boolean(options?.isSuperuser);
  const canAccess = (path: string) => canAccessAdminPath(path, options);

  const sections: NavSectionProps['data'] = [];

  const platformItems = [
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
    isSuperuser && canAccess(RoutePath.organizationRestaurantList)
      ? {
          title: t('restaurants'),
          path: RoutePath.organizationRestaurantList,
          icon: ICONS.restaurants,
        }
      : null,
  ].filter(Boolean) as NavSectionProps['data'][number]['items'];

  if (platformItems.length) {
    sections.push({
      subheader: t('platformSection'),
      items: platformItems,
    });
  }

  if (!isSuperuser && canAccess(RoutePath.organizationRestaurantList)) {
    sections.push({
      subheader: t('main'),
      items: [
        {
          title: t('restaurants'),
          path: RoutePath.organizationRestaurantList,
          icon: ICONS.restaurants,
        },
      ],
    });
  }

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
  ].filter(Boolean) as NavSectionProps['data'][number]['items'];

  const kitchenChildren = canAccess(RoutePath.kitchenTicketList)
    ? [
        {
          title: t('kitchenTickets'),
          path: RoutePath.kitchenTicketList,
          icon: ICONS.kitchenTickets,
        },
      ]
    : [];

  const catalogChildren = [
    canAccess(RoutePath.catalogCategoryList)
      ? {
          title: t('categories'),
          path: RoutePath.catalogCategoryList,
          icon: ICONS.categories,
        }
      : null,
    canAccess(RoutePath.catalogItemList)
      ? {
          title: t('items'),
          path: RoutePath.catalogItemList,
          icon: ICONS.items,
        }
      : null,
  ].filter(Boolean) as NavSectionProps['data'][number]['items'];

  const floorChildren = [
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

  const employeeChildren = [
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

  const mainItems = [
    canAccess(RoutePath.reports)
      ? {
          title: t('reports'),
          path: RoutePath.reports,
          icon: ICONS.reports,
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
    kitchenChildren.length
      ? {
          title: t('kitchen'),
          path: kitchenChildren[0].path,
          icon: ICONS.kitchen,
          children: kitchenChildren,
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
    canAccessMyRestaurant(options)
      ? {
          title: t('myRestaurant'),
          path: RoutePath.organizationMyRestaurant,
          icon: ICONS.myRestaurant,
        }
      : null,
    employeeChildren.length
      ? {
          title: t('employees'),
          path: employeeChildren[0].path,
          icon: ICONS.employees,
          children: employeeChildren,
        }
      : null,
  ].filter(Boolean) as NavSectionProps['data'][number]['items'];

  if (!mainItems.length) {
    return sections;
  }

  sections.push({
    subheader: t('main'),
    items: mainItems,
  });

  return sections;
};
