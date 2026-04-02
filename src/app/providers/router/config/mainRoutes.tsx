import { Suspense, lazy } from 'react';
import type { RouteObject } from 'react-router';
import { Outlet } from 'react-router';

import { DashboardLayout } from 'app/layouts/Dashboard';
import { RoutePath } from 'app/routes';
import { usePathname } from 'shared/hooks/router';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { ProtectedRoute } from '../guards/ProtectedRoute';

const UsersListPage = lazy(() => import('modules/users/ui/pages/UsersListPage/UsersListPage'));
const EmployeesListPage = lazy(() => import('modules/users/ui/pages/EmployeesListPage/EmployeesListPage'));
const DashboardHomePage = lazy(() => import('modules/platform/ui/pages/DashboardHomePage/DashboardHomePage'));
const BusinessPartnersListPage = lazy(
  () => import('modules/platform/ui/pages/BusinessPartnersListPage/BusinessPartnersListPage'),
);
const BusinessPartnerFormPage = lazy(
  () => import('modules/platform/ui/pages/BusinessPartnerFormPage/BusinessPartnerFormPage'),
);
const TariffsListPage = lazy(() => import('modules/platform/ui/pages/TariffsListPage/TariffsListPage'));
const TariffFormPage = lazy(() => import('modules/platform/ui/pages/TariffFormPage/TariffFormPage'));
const RolesListPage = lazy(() => import('modules/users/ui/pages/RolesListPage/RolesListPage'));
const RoleFormPage = lazy(() => import('modules/users/ui/pages/RoleFormPage/RoleFormPage'));
const PermissionsListPage = lazy(() => import('modules/users/ui/pages/PermissionsListPage/PermissionsListPage'));
const UserFormPage = lazy(() => import('modules/users/ui/pages/UserFormPage/UserFormPage'));
const EmployeeFormPage = lazy(() => import('modules/users/ui/pages/EmployeeFormPage/EmployeeFormPage'));
const UserDetailPage = lazy(() => import('modules/users/ui/pages/UserDetailPage/UserDetailPage'));
const EmployeeDetailPage = lazy(() => import('modules/users/ui/pages/EmployeeDetailPage/EmployeeDetailPage'));
const OrdersListPage = lazy(() => import('modules/orders/ui/pages/OrdersListPage/OrdersListPage'));
const OrderDetailPage = lazy(() => import('modules/orders/ui/pages/OrderDetailPage/OrderDetailPage'));
const OrderItemsListPage = lazy(() => import('modules/orders/ui/pages/OrderItemsListPage/OrderItemsListPage'));
const OrderItemDetailPage = lazy(() => import('modules/orders/ui/pages/OrderItemDetailPage/OrderItemDetailPage'));
const OrderItemNotesListPage = lazy(
  () => import('modules/orders/ui/pages/OrderItemNotesListPage/OrderItemNotesListPage'),
);
const OrderItemNoteDetailPage = lazy(
  () => import('modules/orders/ui/pages/OrderItemNoteDetailPage/OrderItemNoteDetailPage'),
);
const PaymentsListPage = lazy(() => import('modules/orders/ui/pages/PaymentsListPage/PaymentsListPage'));
const PaymentDetailPage = lazy(() => import('modules/orders/ui/pages/PaymentDetailPage/PaymentDetailPage'));
const ReceiptsListPage = lazy(() => import('modules/orders/ui/pages/ReceiptsListPage/ReceiptsListPage'));
const ReceiptDetailPage = lazy(() => import('modules/orders/ui/pages/ReceiptDetailPage/ReceiptDetailPage'));
const ReportsPage = lazy(() => import('modules/reports/ui/pages/ReportsPage/ReportsPage'));
const KitchenTicketsListPage = lazy(
  () => import('modules/kitchen/ui/pages/KitchenTicketsListPage/KitchenTicketsListPage'),
);
const KitchenTicketDetailPage = lazy(
  () => import('modules/kitchen/ui/pages/KitchenTicketDetailPage/KitchenTicketDetailPage'),
);
const CategoriesListPage = lazy(() => import('modules/catalog/ui/pages/CategoriesListPage/CategoriesListPage'));
const CatalogBrowserPage = lazy(() => import('modules/catalog/ui/pages/CatalogBrowserPage/CatalogBrowserPage'));
const CategoryFormPage = lazy(() => import('modules/catalog/ui/pages/CategoryFormPage/CategoryFormPage'));
const ProductsListPage = lazy(() => import('modules/catalog/ui/pages/ProductsListPage/ProductsListPage'));
const ProductFormPage = lazy(() => import('modules/catalog/ui/pages/ProductFormPage/ProductFormPage'));
const RestaurantsListPage = lazy(
  () => import('modules/organizations/ui/pages/RestaurantsListPage/RestaurantsListPage'),
);
const MyRestaurantPage = lazy(() => import('modules/organizations/ui/pages/MyRestaurantPage/MyRestaurantPage'));
const MyRestaurantGeneralPage = lazy(
  () => import('modules/organizations/ui/pages/MyRestaurantGeneralPage/MyRestaurantGeneralPage'),
);
const MyRestaurantCashDesksPage = lazy(
  () => import('modules/organizations/ui/pages/MyRestaurantCashDesksPage/MyRestaurantCashDesksPage'),
);
const MyRestaurantDevicesPage = lazy(
  () => import('modules/organizations/ui/pages/MyRestaurantDevicesPage/MyRestaurantDevicesPage'),
);
const MyRestaurantPrepStationsPage = lazy(
  () => import('modules/organizations/ui/pages/MyRestaurantPrepStationsPage/MyRestaurantPrepStationsPage'),
);
const MyRestaurantDistributionPointsPage = lazy(
  () => import('modules/organizations/ui/pages/MyRestaurantDistributionPointsPage/MyRestaurantDistributionPointsPage'),
);
const RestaurantFormPage = lazy(() => import('modules/organizations/ui/pages/RestaurantFormPage/RestaurantFormPage'));
const HallsListPage = lazy(() => import('modules/floor/ui/pages/HallsListPage/HallsListPage'));
const HallConstructorPage = lazy(() => import('modules/floor/ui/pages/HallConstructorPage/HallConstructorPage'));
const ZonesListPage = lazy(() => import('modules/floor/ui/pages/ZonesListPage/ZonesListPage'));
const TableSessionsListPage = lazy(() => import('modules/floor/ui/pages/TableSessionsListPage/TableSessionsListPage'));
const TableSessionFormPage = lazy(() => import('modules/floor/ui/pages/TableSessionFormPage/TableSessionFormPage'));

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
    element: <DashboardHomePage />,
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
    element: <HallsListPage />,
  },
  {
    path: RoutePath.floorHallEdit,
    element: <HallsListPage />,
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
    element: <ZonesListPage />,
  },
  {
    path: RoutePath.floorZoneEdit,
    element: <ZonesListPage />,
  },
  {
    path: RoutePath.floorTableSessionList,
    element: <TableSessionsListPage />,
  },
  {
    path: RoutePath.floorTableSessionCreate,
    element: <TableSessionFormPage />,
  },
  {
    path: RoutePath.floorTableSessionEdit,
    element: <TableSessionFormPage />,
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
