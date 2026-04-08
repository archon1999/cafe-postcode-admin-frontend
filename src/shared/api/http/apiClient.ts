import type {
  AdminBusinessPartner,
  AdminBusinessPartnerLookupResult,
  AdminBusinessPartnerPayload,
  AdminBusinessPartnersQueryParams,
  AdminCashDesk,
  AdminCashDesksQueryParams,
  AdminCashDeskPayload,
  AdminCollectionResponse,
  AdminDevice,
  AdminDevicesQueryParams,
  AdminDevicePayload,
  AdminDistributionPoint,
  AdminDistributionPointsQueryParams,
  AdminDistributionPointPayload,
  AdminMxikLookupResult,
  AdminDiningTable,
  AdminDiningTablesQueryParams,
  AdminDiningTablePayload,
  AdminHallConstructor,
  AdminHallConstructorPayload,
  AdminHall,
  AdminHallsQueryParams,
  AdminHallPayload,
  AdminKitchenTicket,
  AdminKitchenTicketsQueryParams,
  AdminLoginRequest,
  AdminLoginResponse,
  AdminPaginatedResponse,
  AdminPermission,
  AdminPermissionsQueryParams,
  AdminPartnerActivationResult,
  AdminPrepStation,
  AdminPrepStationsQueryParams,
  AdminPrepStationPayload,
  AdminOrder,
  AdminOrderItem,
  AdminOrderItemNote,
  AdminOrderItemNotesQueryParams,
  AdminOrderItemsQueryParams,
  AdminOrdersQueryParams,
  AdminPayment,
  AdminPaymentBreakdownReportQueryParams,
  AdminPaymentBreakdownReportRow,
  AdminPaymentsQueryParams,
  AdminReceipt,
  AdminReceiptsQueryParams,
  AdminReportExportFile,
  AdminReportSummary,
  AdminSalesReportQueryParams,
  AdminSalesReportRow,
  AdminShiftReportQueryParams,
  AdminShiftReportRow,
  AdminRestaurant,
  AdminRestaurantActivationPayload,
  AdminRestaurantActivationOptions,
  AdminRestaurantActivationResult,
  AdminRestaurantsQueryParams,
  AdminRestaurantPayload,
  AdminSummaryReportQueryParams,
  AdminTariff,
  AdminTariffOption,
  AdminTariffPayload,
  AdminTariffsQueryParams,
  AdminTopItemsReportQueryParams,
  AdminTopItemsReportRow,
  AdminTopStaffReportQueryParams,
  AdminTopStaffReportRow,
  AdminRole,
  AdminRolesQueryParams,
  AdminRolePayload,
  AdminSessionUser,
  AdminOpenChecksReportQueryParams,
  AdminOpenChecksReportRow,
  AdminTableSession,
  AdminTableSessionsQueryParams,
  AdminTableSessionPayload,
  AdminUser,
  AdminUserPayload,
  AdminUsersQueryParams,
  AdminZoneOrCabin,
  AdminZoneOrCabinPayload,
  AdminZonesQueryParams,
  CatalogCategory,
  AdminCatalogCategoriesQueryParams,
  CatalogCategoryPayload,
  CatalogItem,
  AdminCatalogItemsQueryParams,
  CatalogItemPayload,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

function extractCollectionData<T>(payload: AdminCollectionResponse<T> | T[]): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload.data) ? payload.data : [];
}

function extractFilename(disposition?: string | null, fallback = 'report.xlsx') {
  if (!disposition) {
    return fallback;
  }

  const match = disposition.match(/filename="?([^"]+)"?/i);
  if (!match?.[1]) {
    return fallback;
  }

  return decodeURIComponent(match[1]);
}

function mapReportParams(params: {
  startDate?: string;
  endDate?: string;
  search?: string;
  ordering?: string;
  page?: number;
  pageSize?: number;
  paymentMethod?: string;
  status?: string;
  hallId?: string;
  categoryId?: string;
  cashDeskId?: string;
  cashierId?: string;
  differenceOnly?: boolean;
}) {
  return {
    startDate: params.startDate,
    endDate: params.endDate,
    search: params.search,
    ordering: params.ordering,
    page: params.page,
    pageSize: params.pageSize,
    paymentMethod: params.paymentMethod,
    status: params.status,
    hallId: params.hallId,
    categoryId: params.categoryId,
    cashDeskId: params.cashDeskId,
    cashierId: params.cashierId,
    differenceOnly: params.differenceOnly,
  };
}

export const apiClient = {
  loginAdmin(payload: AdminLoginRequest) {
    return instance.post<AdminLoginResponse>('/api/v1/admin/auth/login/', payload).then((response) => response.data);
  },

  logoutAdmin() {
    return instance.post<void>('/api/v1/admin/auth/logout/').then((response) => response.data);
  },

  getAdminMe() {
    return instance.get<AdminSessionUser>('/api/v1/admin/auth/me/').then((response) => response.data);
  },

  getAdminMyRestaurant() {
    return instance.get<AdminRestaurant>('/api/v1/admin/restaurants/my-restaurant/').then((response) => response.data);
  },

  getAdminUsers(params: AdminUsersQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminUser>>('/api/v1/admin/users/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          role_id_in: params.roleIdIn,
          employment_status_in: params.employmentStatusIn,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminUserById(id: string) {
    return instance.get<AdminUser>(`/api/v1/admin/users/${id}/`).then((response) => response.data);
  },

  createAdminUser(payload: AdminUserPayload) {
    return instance.post<AdminUser>('/api/v1/admin/users/', payload).then((response) => response.data);
  },

  updateAdminUser(id: string, payload: AdminUserPayload) {
    return instance.put<AdminUser>(`/api/v1/admin/users/${id}/`, payload).then((response) => response.data);
  },

  getAdminEmployees(params: AdminUsersQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminUser>>('/api/v1/admin/employees/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          role_id_in: params.roleIdIn,
          employment_status_in: params.employmentStatusIn,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminEmployeeById(id: string) {
    return instance.get<AdminUser>(`/api/v1/admin/employees/${id}/`).then((response) => response.data);
  },

  createAdminEmployee(payload: AdminUserPayload) {
    return instance.post<AdminUser>('/api/v1/admin/employees/', payload).then((response) => response.data);
  },

  updateAdminEmployee(id: string, payload: AdminUserPayload) {
    return instance.put<AdminUser>(`/api/v1/admin/employees/${id}/`, payload).then((response) => response.data);
  },

  getAdminRoles() {
    return instance
      .get<AdminCollectionResponse<AdminRole> | AdminRole[]>('/api/v1/admin/roles/', {
        params: { pageSize: 100 },
      })
      .then((response) => extractCollectionData(response.data));
  },

  getAdminEmployeeRoles() {
    return instance
      .get<AdminCollectionResponse<AdminRole> | AdminRole[]>('/api/v1/admin/employees/roles/', {
        params: { pageSize: 100 },
      })
      .then((response) => extractCollectionData(response.data));
  },

  getAdminRolesPage(params: AdminRolesQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminRole>>('/api/v1/admin/roles/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          type_in: params.typeIn,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminRoleById(id: string) {
    return instance.get<AdminRole>(`/api/v1/admin/roles/${id}/`).then((response) => response.data);
  },

  createAdminRole(payload: AdminRolePayload) {
    return instance.post<AdminRole>('/api/v1/admin/roles/', payload).then((response) => response.data);
  },

  updateAdminRole(id: string, payload: AdminRolePayload) {
    return instance.put<AdminRole>(`/api/v1/admin/roles/${id}/`, payload).then((response) => response.data);
  },

  deleteAdminRole(id: string) {
    return instance.delete<void>(`/api/v1/admin/roles/${id}/`).then((response) => response.data);
  },

  getAdminPermissions() {
    return instance
      .get<AdminCollectionResponse<AdminPermission> | AdminPermission[]>('/api/v1/admin/permissions/options/')
      .then((response) => extractCollectionData(response.data));
  },

  getAdminPermissionsPage(params: AdminPermissionsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminPermission>>('/api/v1/admin/permissions/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          scope_in: params.scopeIn,
          action_in: params.actionIn,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminHalls(params?: AdminHallsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminHall>>('/api/v1/admin/floor/halls/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          isActive: params?.isActive,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminHallById(id: string) {
    return instance.get<AdminHall>(`/api/v1/admin/floor/halls/${id}/`).then((response) => response.data);
  },

  getAdminHallConstructor(id: string) {
    return instance
      .get<AdminHallConstructor>(`/api/v1/admin/floor/halls/${id}/constructor/`)
      .then((response) => response.data);
  },

  getAdminZones(params?: AdminZonesQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminZoneOrCabin>>('/api/v1/admin/floor/zones/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          is_active: params?.isActive,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminZoneById(id: string) {
    return instance.get<AdminZoneOrCabin>(`/api/v1/admin/floor/zones/${id}/`).then((response) => response.data);
  },

  createAdminZone(payload: AdminZoneOrCabinPayload) {
    return instance.post<AdminZoneOrCabin>('/api/v1/admin/floor/zones/', payload).then((response) => response.data);
  },

  updateAdminZone(id: string, payload: AdminZoneOrCabinPayload) {
    return instance
      .put<AdminZoneOrCabin>(`/api/v1/admin/floor/zones/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminZone(id: string) {
    return instance.delete<void>(`/api/v1/admin/floor/zones/${id}/`).then((response) => response.data);
  },

  createAdminHall(payload: AdminHallPayload) {
    return instance.post<AdminHall>('/api/v1/admin/floor/halls/', payload).then((response) => response.data);
  },

  updateAdminHall(id: string, payload: AdminHallPayload) {
    return instance.put<AdminHall>(`/api/v1/admin/floor/halls/${id}/`, payload).then((response) => response.data);
  },

  updateAdminHallConstructor(id: string, payload: AdminHallConstructorPayload) {
    return instance
      .put<AdminHallConstructor>(`/api/v1/admin/floor/halls/${id}/constructor/`, payload)
      .then((response) => response.data);
  },

  deleteAdminHall(id: string) {
    return instance.delete<void>(`/api/v1/admin/floor/halls/${id}/`).then((response) => response.data);
  },

  getAdminDiningTables(params?: AdminDiningTablesQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminDiningTable>>('/api/v1/admin/floor/tables/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          hallIdIn: params?.hallIdIn,
          shapeIn: params?.shapeIn,
          statusIn: params?.statusIn,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminDiningTableById(id: string) {
    return instance.get<AdminDiningTable>(`/api/v1/admin/floor/tables/${id}/`).then((response) => response.data);
  },

  createAdminDiningTable(payload: AdminDiningTablePayload) {
    return instance.post<AdminDiningTable>('/api/v1/admin/floor/tables/', payload).then((response) => response.data);
  },

  updateAdminDiningTable(id: string, payload: AdminDiningTablePayload) {
    return instance
      .put<AdminDiningTable>(`/api/v1/admin/floor/tables/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminDiningTable(id: string) {
    return instance.delete<void>(`/api/v1/admin/floor/tables/${id}/`).then((response) => response.data);
  },

  getAdminTableSessions(params?: AdminTableSessionsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminTableSession>>('/api/v1/admin/floor/table-sessions/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          hallIdIn: params?.hallIdIn,
          statusIn: params?.statusIn,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminTableSessionById(id: string) {
    return instance
      .get<AdminTableSession>(`/api/v1/admin/floor/table-sessions/${id}/`)
      .then((response) => response.data);
  },

  createAdminTableSession(payload: AdminTableSessionPayload) {
    return instance
      .post<AdminTableSession>('/api/v1/admin/floor/table-sessions/', payload)
      .then((response) => response.data);
  },

  updateAdminTableSession(id: string, payload: AdminTableSessionPayload) {
    return instance
      .put<AdminTableSession>(`/api/v1/admin/floor/table-sessions/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminTableSession(id: string) {
    return instance.delete<void>(`/api/v1/admin/floor/table-sessions/${id}/`).then((response) => response.data);
  },

  getAdminPrepStations(params?: AdminPrepStationsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminPrepStation>>('/api/v1/admin/restaurants/prep-stations/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          kindIn: params?.kindIn,
          isActive: params?.isActive,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminPrepStationById(id: string) {
    return instance
      .get<AdminPrepStation>(`/api/v1/admin/restaurants/prep-stations/${id}/`)
      .then((response) => response.data);
  },

  createAdminPrepStation(payload: AdminPrepStationPayload) {
    return instance
      .post<AdminPrepStation>('/api/v1/admin/restaurants/prep-stations/', payload)
      .then((response) => response.data);
  },

  updateAdminPrepStation(id: string, payload: AdminPrepStationPayload) {
    return instance
      .put<AdminPrepStation>(`/api/v1/admin/restaurants/prep-stations/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminPrepStation(id: string) {
    return instance.delete<void>(`/api/v1/admin/restaurants/prep-stations/${id}/`).then((response) => response.data);
  },

  getAdminCashDesks(params?: AdminCashDesksQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminCashDesk>>('/api/v1/admin/restaurants/cash-desks/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          isActive: params?.isActive,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminCashDeskById(id: string) {
    return instance.get<AdminCashDesk>(`/api/v1/admin/restaurants/cash-desks/${id}/`).then((response) => response.data);
  },

  createAdminCashDesk(payload: AdminCashDeskPayload) {
    return instance
      .post<AdminCashDesk>('/api/v1/admin/restaurants/cash-desks/', payload)
      .then((response) => response.data);
  },

  updateAdminCashDesk(id: string, payload: AdminCashDeskPayload) {
    return instance
      .put<AdminCashDesk>(`/api/v1/admin/restaurants/cash-desks/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminCashDesk(id: string) {
    return instance.delete<void>(`/api/v1/admin/restaurants/cash-desks/${id}/`).then((response) => response.data);
  },

  getAdminDevices(params?: AdminDevicesQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminDevice>>('/api/v1/admin/restaurants/devices/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          modeIn: params?.modeIn,
          isActive: params?.isActive,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminDeviceById(id: string) {
    return instance.get<AdminDevice>(`/api/v1/admin/restaurants/devices/${id}/`).then((response) => response.data);
  },

  createAdminDevice(payload: AdminDevicePayload) {
    return instance.post<AdminDevice>('/api/v1/admin/restaurants/devices/', payload).then((response) => response.data);
  },

  updateAdminDevice(id: string, payload: AdminDevicePayload) {
    return instance
      .put<AdminDevice>(`/api/v1/admin/restaurants/devices/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminDevice(id: string) {
    return instance.delete<void>(`/api/v1/admin/restaurants/devices/${id}/`).then((response) => response.data);
  },

  getAdminDistributionPoints(params?: AdminDistributionPointsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminDistributionPoint>>('/api/v1/admin/restaurants/distribution-points/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          kindIn: params?.kindIn,
          isActive: params?.isActive,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminDistributionPointById(id: string) {
    return instance
      .get<AdminDistributionPoint>(`/api/v1/admin/restaurants/distribution-points/${id}/`)
      .then((response) => response.data);
  },

  createAdminDistributionPoint(payload: AdminDistributionPointPayload) {
    return instance
      .post<AdminDistributionPoint>('/api/v1/admin/restaurants/distribution-points/', payload)
      .then((response) => response.data);
  },

  updateAdminDistributionPoint(id: string, payload: AdminDistributionPointPayload) {
    return instance
      .put<AdminDistributionPoint>(`/api/v1/admin/restaurants/distribution-points/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminDistributionPoint(id: string) {
    return instance
      .delete<void>(`/api/v1/admin/restaurants/distribution-points/${id}/`)
      .then((response) => response.data);
  },

  getAdminBusinessPartners(params?: AdminBusinessPartnersQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminBusinessPartner>>('/api/v1/admin/platform/business-partners/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          isActive: params?.isActive,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminBusinessPartnerById(id: string) {
    return instance
      .get<AdminBusinessPartner>(`/api/v1/admin/platform/business-partners/${id}/`)
      .then((response) => response.data);
  },

  lookupAdminBusinessPartner(inn: string) {
    return instance
      .get<AdminBusinessPartnerLookupResult>('/api/v1/admin/platform/business-partners/lookup/', {
        params: { inn },
      })
      .then((response) => response.data);
  },

  createAdminBusinessPartner(payload: AdminBusinessPartnerPayload) {
    return instance
      .post<AdminBusinessPartner>('/api/v1/admin/platform/business-partners/', payload)
      .then((response) => response.data);
  },

  updateAdminBusinessPartner(id: string, payload: AdminBusinessPartnerPayload) {
    return instance
      .put<AdminBusinessPartner>(`/api/v1/admin/platform/business-partners/${id}/`, payload)
      .then((response) => response.data);
  },

  activateAdminBusinessPartner(id: string) {
    return instance
      .post<AdminPartnerActivationResult>(`/api/v1/admin/platform/business-partners/${id}/activate/`)
      .then((response) => response.data);
  },

  deactivateAdminBusinessPartner(id: string) {
    return instance
      .post<void>(`/api/v1/admin/platform/business-partners/${id}/deactivate/`)
      .then((response) => response.data);
  },

  resetAdminBusinessPartnerPassword(id: string) {
    return instance
      .post<AdminPartnerActivationResult>(`/api/v1/admin/platform/business-partners/${id}/reset-password/`)
      .then((response) => response.data);
  },

  getAdminTariffs(params?: AdminTariffsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminTariff>>('/api/v1/admin/platform/tariffs/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          isActive: params?.isActive,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminTariffById(id: string) {
    return instance.get<AdminTariff>(`/api/v1/admin/platform/tariffs/${id}/`).then((response) => response.data);
  },

  getAdminTariffOptions() {
    return instance
      .get<AdminCollectionResponse<AdminTariffOption> | AdminTariffOption[]>('/api/v1/admin/platform/tariff-options/')
      .then((response) => extractCollectionData(response.data));
  },

  createAdminTariff(payload: AdminTariffPayload) {
    return instance.post<AdminTariff>('/api/v1/admin/platform/tariffs/', payload).then((response) => response.data);
  },

  updateAdminTariff(id: string, payload: AdminTariffPayload) {
    return instance
      .put<AdminTariff>(`/api/v1/admin/platform/tariffs/${id}/`, payload)
      .then((response) => response.data);
  },

  getAdminRestaurants(params?: AdminRestaurantsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminRestaurant>>('/api/v1/admin/restaurants/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          isActive: params?.isActive,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminRestaurantById(id: string) {
    return instance.get<AdminRestaurant>(`/api/v1/admin/restaurants/${id}/`).then((response) => response.data);
  },

  createAdminRestaurant(payload: AdminRestaurantPayload) {
    return instance.post<AdminRestaurant>('/api/v1/admin/restaurants/', payload).then((response) => response.data);
  },

  updateAdminRestaurant(id: string, payload: AdminRestaurantPayload) {
    return instance.put<AdminRestaurant>(`/api/v1/admin/restaurants/${id}/`, payload).then((response) => response.data);
  },

  deleteAdminRestaurant(id: string) {
    return instance.delete<void>(`/api/v1/admin/restaurants/${id}/`).then((response) => response.data);
  },

  activateAdminRestaurant(id: string, payload: AdminRestaurantActivationPayload) {
    return instance
      .post<AdminRestaurantActivationResult>(`/api/v1/admin/platform/restaurants/${id}/activate/`, payload)
      .then((response) => response.data);
  },

  getAdminRestaurantActivationOptions() {
    return instance
      .get<AdminRestaurantActivationOptions>('/api/v1/admin/platform/restaurants/activation-options/')
      .then((response) => response.data);
  },

  rotateAdminRestaurantAuthCode(id: string) {
    return instance
      .post<AdminRestaurant>(`/api/v1/admin/platform/restaurants/${id}/rotate-auth-code/`)
      .then((response) => response.data);
  },

  deactivateAdminRestaurant(id: string) {
    return instance
      .post<void>(`/api/v1/admin/platform/restaurants/${id}/deactivate/`)
      .then((response) => response.data);
  },

  extendAdminRestaurant(id: string) {
    return instance.post<AdminRestaurant>(`/api/v1/admin/platform/restaurants/${id}/extend/`).then((response) => response.data);
  },

  resetAdminRestaurantPassword(id: string) {
    return instance
      .post<AdminRestaurantActivationResult>(`/api/v1/admin/platform/restaurants/${id}/reset-password/`)
      .then((response) => response.data);
  },

  getAdminKitchenTickets(params: AdminKitchenTicketsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminKitchenTicket>>('/api/v1/admin/kitchen/tickets/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          statusIn: params.statusIn,
          prepStationIdIn: params.prepStationIdIn,
          routedViaIn: params.routedViaIn,
          isPrinted: params.isPrinted,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminKitchenTicketById(id: string) {
    return instance.get<AdminKitchenTicket>(`/api/v1/admin/kitchen/tickets/${id}/`).then((response) => response.data);
  },

  getAdminOrders(params: AdminOrdersQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminOrder>>('/api/v1/admin/sales/orders/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          statusIn: params.statusIn,
          channelIn: params.channelIn,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminOrderById(id: string) {
    return instance.get<AdminOrder>(`/api/v1/admin/sales/orders/${id}/`).then((response) => response.data);
  },

  getAdminOrderItems(params: AdminOrderItemsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminOrderItem>>('/api/v1/admin/sales/order-items/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          statusIn: params.statusIn,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminOrderItemById(id: string) {
    return instance.get<AdminOrderItem>(`/api/v1/admin/sales/order-items/${id}/`).then((response) => response.data);
  },

  getAdminOrderItemNotes(params: AdminOrderItemNotesQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminOrderItemNote>>('/api/v1/admin/sales/order-item-notes/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminOrderItemNoteById(id: string) {
    return instance
      .get<AdminOrderItemNote>(`/api/v1/admin/sales/order-item-notes/${id}/`)
      .then((response) => response.data);
  },

  getAdminPayments(params: AdminPaymentsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminPayment>>('/api/v1/admin/billing/payments/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          statusIn: params.statusIn,
          methodIn: params.methodIn,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminPaymentById(id: string) {
    return instance.get<AdminPayment>(`/api/v1/admin/billing/payments/${id}/`).then((response) => response.data);
  },

  getAdminReceipts(params: AdminReceiptsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminReceipt>>('/api/v1/admin/billing/receipts/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          statusIn: params.statusIn,
          kindIn: params.kindIn,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminReceiptById(id: string) {
    return instance.get<AdminReceipt>(`/api/v1/admin/billing/receipts/${id}/`).then((response) => response.data);
  },

  getAdminCatalogCategories(params?: AdminCatalogCategoriesQueryParams) {
    return instance
      .get<AdminPaginatedResponse<CatalogCategory>>('/api/v1/admin/catalog/categories/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          isActive: params?.isActive,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminCatalogCategoryById(id: string) {
    return instance.get<CatalogCategory>(`/api/v1/admin/catalog/categories/${id}/`).then((response) => response.data);
  },

  createAdminCatalogCategory(payload: CatalogCategoryPayload) {
    return instance
      .post<CatalogCategory>('/api/v1/admin/catalog/categories/', payload)
      .then((response) => response.data);
  },

  updateAdminCatalogCategory(id: string, payload: CatalogCategoryPayload) {
    return instance
      .put<CatalogCategory>(`/api/v1/admin/catalog/categories/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminCatalogCategory(id: string) {
    return instance.delete<void>(`/api/v1/admin/catalog/categories/${id}/`).then((response) => response.data);
  },

  getAdminCatalogItems(params?: AdminCatalogItemsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<CatalogItem>>('/api/v1/admin/catalog/items/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          categoryIdIn: params?.categoryIdIn,
          isActive: params?.isActive,
          isStoplisted: params?.isStoplisted,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminCatalogItemById(id: string) {
    return instance.get<CatalogItem>(`/api/v1/admin/catalog/items/${id}/`).then((response) => response.data);
  },

  createAdminCatalogItem(payload: CatalogItemPayload) {
    return instance.post<CatalogItem>('/api/v1/admin/catalog/items/', payload).then((response) => response.data);
  },

  updateAdminCatalogItem(id: string, payload: CatalogItemPayload) {
    return instance.put<CatalogItem>(`/api/v1/admin/catalog/items/${id}/`, payload).then((response) => response.data);
  },

  deleteAdminCatalogItem(id: string) {
    return instance.delete<void>(`/api/v1/admin/catalog/items/${id}/`).then((response) => response.data);
  },

  searchAdminMxik(params: { query: string; lang?: string; limit?: number }) {
    return instance
      .get<AdminMxikLookupResult[]>('/api/v1/admin/catalog/mxik/search/', {
        params: {
          query: params.query,
          lang: params.lang,
          limit: params.limit,
        },
      })
      .then((response) => response.data);
  },

  getAdminMxikByCode(code: string, lang?: string) {
    return instance
      .get<AdminMxikLookupResult>(`/api/v1/admin/catalog/mxik/${code}/`, {
        params: { lang },
      })
      .then((response) => response.data);
  },

  getAdminReportSummary(params: AdminSummaryReportQueryParams) {
    return instance
      .get<AdminReportSummary>('/api/v1/admin/reporting/summary/', {
        params: mapReportParams(params),
      })
      .then((response) => response.data);
  },

  exportAdminReportSummary(params: AdminSummaryReportQueryParams) {
    return instance
      .get<Blob>('/api/v1/admin/reporting/summary/export/', {
        params: mapReportParams(params),
        responseType: 'blob',
      })
      .then<AdminReportExportFile>((response) => ({
        blob: response.data,
        filename: extractFilename(response.headers['content-disposition'], 'summary-report.xlsx'),
      }));
  },

  getAdminSalesReport(params: AdminSalesReportQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminSalesReportRow>>('/api/v1/admin/reporting/sales/', {
        params: mapReportParams(params),
      })
      .then((response) => response.data);
  },

  exportAdminSalesReport(params: AdminSalesReportQueryParams) {
    return instance
      .get<Blob>('/api/v1/admin/reporting/sales/export/', {
        params: mapReportParams(params),
        responseType: 'blob',
      })
      .then<AdminReportExportFile>((response) => ({
        blob: response.data,
        filename: extractFilename(response.headers['content-disposition'], 'sales-report.xlsx'),
      }));
  },

  getAdminOpenChecksReport(params: AdminOpenChecksReportQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminOpenChecksReportRow>>('/api/v1/admin/reporting/open-checks/', {
        params: mapReportParams(params),
      })
      .then((response) => response.data);
  },

  exportAdminOpenChecksReport(params: AdminOpenChecksReportQueryParams) {
    return instance
      .get<Blob>('/api/v1/admin/reporting/open-checks/export/', {
        params: mapReportParams(params),
        responseType: 'blob',
      })
      .then<AdminReportExportFile>((response) => ({
        blob: response.data,
        filename: extractFilename(response.headers['content-disposition'], 'open-checks-report.xlsx'),
      }));
  },

  getAdminTopItemsReport(params: AdminTopItemsReportQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminTopItemsReportRow>>('/api/v1/admin/reporting/top-items/', {
        params: mapReportParams(params),
      })
      .then((response) => response.data);
  },

  exportAdminTopItemsReport(params: AdminTopItemsReportQueryParams) {
    return instance
      .get<Blob>('/api/v1/admin/reporting/top-items/export/', {
        params: mapReportParams(params),
        responseType: 'blob',
      })
      .then<AdminReportExportFile>((response) => ({
        blob: response.data,
        filename: extractFilename(response.headers['content-disposition'], 'top-items-report.xlsx'),
      }));
  },

  getAdminTopStaffReport(params: AdminTopStaffReportQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminTopStaffReportRow>>('/api/v1/admin/reporting/top-staff/', {
        params: mapReportParams(params),
      })
      .then((response) => response.data);
  },

  exportAdminTopStaffReport(params: AdminTopStaffReportQueryParams) {
    return instance
      .get<Blob>('/api/v1/admin/reporting/top-staff/export/', {
        params: mapReportParams(params),
        responseType: 'blob',
      })
      .then<AdminReportExportFile>((response) => ({
        blob: response.data,
        filename: extractFilename(response.headers['content-disposition'], 'top-staff-report.xlsx'),
      }));
  },

  getAdminPaymentBreakdownReport(params: AdminPaymentBreakdownReportQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminPaymentBreakdownReportRow>>('/api/v1/admin/reporting/payment-breakdown/', {
        params: mapReportParams(params),
      })
      .then((response) => response.data);
  },

  exportAdminPaymentBreakdownReport(params: AdminPaymentBreakdownReportQueryParams) {
    return instance
      .get<Blob>('/api/v1/admin/reporting/payment-breakdown/export/', {
        params: mapReportParams(params),
        responseType: 'blob',
      })
      .then<AdminReportExportFile>((response) => ({
        blob: response.data,
        filename: extractFilename(response.headers['content-disposition'], 'payment-breakdown-report.xlsx'),
      }));
  },

  getAdminShiftReport(params: AdminShiftReportQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminShiftReportRow>>('/api/v1/admin/reporting/shifts/', {
        params: mapReportParams(params),
      })
      .then((response) => response.data);
  },

  exportAdminShiftReport(params: AdminShiftReportQueryParams) {
    return instance
      .get<Blob>('/api/v1/admin/reporting/shifts/export/', {
        params: mapReportParams(params),
        responseType: 'blob',
      })
      .then<AdminReportExportFile>((response) => ({
        blob: response.data,
        filename: extractFilename(response.headers['content-disposition'], 'shift-report.xlsx'),
      }));
  },
};
