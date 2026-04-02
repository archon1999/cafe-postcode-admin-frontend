import { Suspense, lazy } from 'react';
import type { RouteObject } from 'react-router';
import { Navigate, Outlet } from 'react-router';

import { DashboardLayout } from 'app/layouts/Dashboard';
import { RoutePath, getDefaultAdminPath } from 'app/routes';
import { useCurrentUser } from 'modules/auth';
import { usePathname } from 'shared/hooks/router';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { ProtectedRoute } from '../guards/ProtectedRoute';

const UsersListPage = lazy(() => import('modules/user-management/users/ui/pages/UsersListPage/UsersListPage'));
const EmployeesListPage = lazy(
  () => import('modules/restaurant-admin/employees/ui/pages/EmployeesListPage/EmployeesListPage'),
);
const BusinessPartnersListPage = lazy(
  () => import('modules/product-owner/business-partners/ui/pages/BusinessPartnersListPage/BusinessPartnersListPage'),
);
const BusinessPartnerFormPage = lazy(
  () => import('modules/product-owner/business-partners/ui/pages/BusinessPartnerFormPage/BusinessPartnerFormPage'),
);
const TariffsListPage = lazy(() => import('modules/product-owner/tariffs/ui/pages/TariffsListPage/TariffsListPage'));
const TariffFormPage = lazy(() => import('modules/product-owner/tariffs/ui/pages/TariffFormPage/TariffFormPage'));
const RolesListPage = lazy(() => import('modules/user-management/roles/ui/pages/RolesListPage/RolesListPage'));
const RoleFormPage = lazy(() => import('modules/user-management/roles/ui/pages/RoleFormPage/RoleFormPage'));
const PermissionsListPage = lazy(
  () => import('modules/user-management/permissions/ui/pages/PermissionsListPage/PermissionsListPage'),
);
const UserFormPage = lazy(() => import('modules/user-management/users/ui/pages/UserFormPage/UserFormPage'));
const EmployeeFormPage = lazy(
  () => import('modules/restaurant-admin/employees/ui/pages/EmployeeFormPage/EmployeeFormPage'),
);
const UserDetailPage = lazy(() => import('modules/user-management/users/ui/pages/UserDetailPage/UserDetailPage'));
const EmployeeDetailPage = lazy(
  () => import('modules/restaurant-admin/employees/ui/pages/EmployeeDetailPage/EmployeeDetailPage'),
);
const OrdersListPage = lazy(() => import('modules/restaurant-admin/orders/ui/pages/OrdersListPage/OrdersListPage'));
const OrderDetailPage = lazy(() => import('modules/restaurant-admin/orders/ui/pages/OrderDetailPage/OrderDetailPage'));
const OrderItemsListPage = lazy(
  () => import('modules/restaurant-admin/orders/ui/pages/OrderItemsListPage/OrderItemsListPage'),
);
const OrderItemDetailPage = lazy(
  () => import('modules/restaurant-admin/orders/ui/pages/OrderItemDetailPage/OrderItemDetailPage'),
);
const OrderItemNotesListPage = lazy(
  () => import('modules/restaurant-admin/orders/ui/pages/OrderItemNotesListPage/OrderItemNotesListPage'),
);
const OrderItemNoteDetailPage = lazy(
  () => import('modules/restaurant-admin/orders/ui/pages/OrderItemNoteDetailPage/OrderItemNoteDetailPage'),
);
const PaymentsListPage = lazy(
  () => import('modules/restaurant-admin/orders/ui/pages/PaymentsListPage/PaymentsListPage'),
);
const PaymentDetailPage = lazy(
  () => import('modules/restaurant-admin/orders/ui/pages/PaymentDetailPage/PaymentDetailPage'),
);
const ReceiptsListPage = lazy(
  () => import('modules/restaurant-admin/orders/ui/pages/ReceiptsListPage/ReceiptsListPage'),
);
const ReceiptDetailPage = lazy(
  () => import('modules/restaurant-admin/orders/ui/pages/ReceiptDetailPage/ReceiptDetailPage'),
);
const ReportsPage = lazy(() => import('modules/restaurant-admin/reports/ui/pages/ReportsPage/ReportsPage'));
const KitchenTicketsListPage = lazy(
  () => import('modules/restaurant-admin/kitchen/ui/pages/KitchenTicketsListPage/KitchenTicketsListPage'),
);
const KitchenTicketDetailPage = lazy(
  () => import('modules/restaurant-admin/kitchen/ui/pages/KitchenTicketDetailPage/KitchenTicketDetailPage'),
);
const CategoriesListPage = lazy(
  () => import('modules/restaurant-admin/catalog/ui/pages/CategoriesListPage/CategoriesListPage'),
);
const CatalogBrowserPage = lazy(
  () => import('modules/restaurant-admin/catalog/ui/pages/CatalogBrowserPage/CatalogBrowserPage'),
);
const CategoryFormPage = lazy(
  () => import('modules/restaurant-admin/catalog/ui/pages/CategoryFormPage/CategoryFormPage'),
);
const ProductsListPage = lazy(
  () => import('modules/restaurant-admin/catalog/ui/pages/ProductsListPage/ProductsListPage'),
);
const ProductFormPage = lazy(() => import('modules/restaurant-admin/catalog/ui/pages/ProductFormPage/ProductFormPage'));
const RestaurantsListPage = lazy(
  () => import('modules/business-partner/restaurants/ui/pages/RestaurantsListPage/RestaurantsListPage'),
);
const MyRestaurantPage = lazy(
  () => import('modules/restaurant-admin/restaurant-management/ui/pages/MyRestaurantPage/MyRestaurantPage'),
);
const MyRestaurantGeneralPage = lazy(
  () =>
    import('modules/restaurant-admin/restaurant-management/ui/pages/MyRestaurantGeneralPage/MyRestaurantGeneralPage'),
);
const MyRestaurantCashDesksPage = lazy(
  () =>
    import(
      'modules/restaurant-admin/restaurant-management/ui/pages/MyRestaurantCashDesksPage/MyRestaurantCashDesksPage'
    ),
);
const MyRestaurantDevicesPage = lazy(
  () =>
    import('modules/restaurant-admin/restaurant-management/ui/pages/MyRestaurantDevicesPage/MyRestaurantDevicesPage'),
);
const MyRestaurantPrepStationsPage = lazy(
  () =>
    import(
      'modules/restaurant-admin/restaurant-management/ui/pages/MyRestaurantPrepStationsPage/MyRestaurantPrepStationsPage'
    ),
);
const MyRestaurantDistributionPointsPage = lazy(
  () =>
    import(
      'modules/restaurant-admin/restaurant-management/ui/pages/MyRestaurantDistributionPointsPage/MyRestaurantDistributionPointsPage'
    ),
);
const RestaurantFormPage = lazy(
  () => import('modules/business-partner/restaurants/ui/pages/RestaurantFormPage/RestaurantFormPage'),
);
const HallsListPage = lazy(() => import('modules/restaurant-admin/floor/ui/pages/HallsListPage/HallsListPage'));
const HallFormPage = lazy(() => import('modules/restaurant-admin/floor/ui/pages/HallFormPage/HallFormPage'));
const HallConstructorPage = lazy(
  () => import('modules/restaurant-admin/floor/ui/pages/HallConstructorPage/HallConstructorPage'),
);
const ZonesListPage = lazy(() => import('modules/restaurant-admin/floor/ui/pages/ZonesListPage/ZonesListPage'));
const ZoneFormPage = lazy(() => import('modules/restaurant-admin/floor/ui/pages/ZoneFormPage/ZoneFormPage'));
const TableSessionsListPage = lazy(
  () => import('modules/restaurant-admin/floor/ui/pages/TableSessionsListPage/TableSessionsListPage'),
);

function MainRedirectPage() {
  const { profile } = useCurrentUser();

  if (!profile) {
    return <LoadingScreen />;
  }

  const nextPath = getDefaultAdminPath(profile);

  if (!nextPath) {
    return <LoadingScreen />;
  }

  return <Navigate replace to={nextPath} />;
}

function SuspenseOutlet() {
  const pathname = usePathname();

  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const mainChildren: RouteObject[] = [
  {
    path: RoutePath.main,
    element: <MainRedirectPage />,
  },
  {
    path: RoutePath.platformBusinessPartnerList,
    element: <BusinessPartnersListPage />,
  },
  {
    path: RoutePath.platformBusinessPartnerCreate,
    element: <BusinessPartnerFormPage />,
  },
  {
    path: RoutePath.platformBusinessPartnerEdit,
    element: <BusinessPartnerFormPage />,
  },
  {
    path: RoutePath.platformTariffList,
    element: <TariffsListPage />,
  },
  {
    path: RoutePath.platformTariffCreate,
    element: <TariffFormPage />,
  },
  {
    path: RoutePath.platformTariffEdit,
    element: <TariffFormPage />,
  },
  {
    path: RoutePath.userList,
    element: <UsersListPage />,
  },
  {
    path: RoutePath.employeeList,
    element: <EmployeesListPage />,
  },
  {
    path: RoutePath.roleList,
    element: <RolesListPage />,
  },
  {
    path: RoutePath.roleCreate,
    element: <RoleFormPage />,
  },
  {
    path: RoutePath.roleEdit,
    element: <RoleFormPage />,
  },
  {
    path: RoutePath.permissionList,
    element: <PermissionsListPage />,
  },
  {
    path: RoutePath.orderList,
    element: <OrdersListPage />,
  },
  {
    path: RoutePath.orderView,
    element: <OrderDetailPage />,
  },
  {
    path: RoutePath.orderItemList,
    element: <OrderItemsListPage />,
  },
  {
    path: RoutePath.orderItemView,
    element: <OrderItemDetailPage />,
  },
  {
    path: RoutePath.orderItemNoteList,
    element: <OrderItemNotesListPage />,
  },
  {
    path: RoutePath.orderItemNoteView,
    element: <OrderItemNoteDetailPage />,
  },
  {
    path: RoutePath.paymentList,
    element: <PaymentsListPage />,
  },
  {
    path: RoutePath.paymentView,
    element: <PaymentDetailPage />,
  },
  {
    path: RoutePath.receiptList,
    element: <ReceiptsListPage />,
  },
  {
    path: RoutePath.reports,
    element: <ReportsPage />,
  },
  {
    path: RoutePath.reportDetail,
    element: <ReportsPage />,
  },
  {
    path: RoutePath.receiptView,
    element: <ReceiptDetailPage />,
  },
  {
    path: RoutePath.kitchenTicketList,
    element: <KitchenTicketsListPage />,
  },
  {
    path: RoutePath.kitchenTicketView,
    element: <KitchenTicketDetailPage />,
  },
  {
    path: RoutePath.catalogCategoryList,
    element: <CategoriesListPage />,
  },
  {
    path: RoutePath.catalogBrowser,
    element: <CatalogBrowserPage />,
  },
  {
    path: RoutePath.catalogCategoryCreate,
    element: <CategoryFormPage />,
  },
  {
    path: RoutePath.catalogCategoryEdit,
    element: <CategoryFormPage />,
  },
  {
    path: RoutePath.catalogItemList,
    element: <ProductsListPage />,
  },
  {
    path: RoutePath.catalogItemCreate,
    element: <ProductFormPage />,
  },
  {
    path: RoutePath.catalogItemEdit,
    element: <ProductFormPage />,
  },
  {
    path: RoutePath.organizationRestaurantList,
    element: <RestaurantsListPage />,
  },
  {
    path: RoutePath.organizationMyRestaurant,
    element: <MyRestaurantPage />,
  },
  {
    path: RoutePath.organizationMyRestaurantGeneral,
    element: <MyRestaurantGeneralPage />,
  },
  {
    path: RoutePath.organizationMyRestaurantCashDeskList,
    element: <MyRestaurantCashDesksPage />,
  },
  {
    path: RoutePath.organizationMyRestaurantDeviceList,
    element: <MyRestaurantDevicesPage />,
  },
  {
    path: RoutePath.organizationMyRestaurantPrepStationList,
    element: <MyRestaurantPrepStationsPage />,
  },
  {
    path: RoutePath.organizationMyRestaurantDistributionPointList,
    element: <MyRestaurantDistributionPointsPage />,
  },
  {
    path: RoutePath.organizationRestaurantCreate,
    element: <RestaurantFormPage />,
  },
  {
    path: RoutePath.organizationRestaurantEdit,
    element: <RestaurantFormPage />,
  },
  {
    path: RoutePath.floorHallList,
    element: <HallsListPage />,
  },
  {
    path: RoutePath.floorHallCreate,
    element: <HallFormPage />,
  },
  {
    path: RoutePath.floorHallEdit,
    element: <HallFormPage />,
  },
  {
    path: RoutePath.floorHallConstructor,
    element: <HallConstructorPage />,
  },
  {
    path: RoutePath.floorZoneList,
    element: <ZonesListPage />,
  },
  {
    path: RoutePath.floorZoneCreate,
    element: <ZoneFormPage />,
  },
  {
    path: RoutePath.floorZoneEdit,
    element: <ZoneFormPage />,
  },
  {
    path: RoutePath.floorTableSessionList,
    element: <TableSessionsListPage />,
  },
  {
    path: RoutePath.floorTableSessionCreate,
    element: <Navigate replace to={RoutePath.floorTableSessionList} />,
  },
  {
    path: RoutePath.floorTableSessionEdit,
    element: <Navigate replace to={RoutePath.floorTableSessionList} />,
  },
  {
    path: RoutePath.userCreate,
    element: <UserFormPage />,
  },
  {
    path: RoutePath.employeeCreate,
    element: <EmployeeFormPage />,
  },
  {
    path: RoutePath.userView,
    element: <UserDetailPage />,
  },
  {
    path: RoutePath.employeeView,
    element: <EmployeeDetailPage />,
  },
  {
    path: RoutePath.userEdit,
    element: <UserFormPage />,
  },
  {
    path: RoutePath.employeeEdit,
    element: <EmployeeFormPage />,
  },
];

export const mainRoutes: RouteObject[] = [
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <SuspenseOutlet />
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: mainChildren,
  },
];
