export type AdminPermission = {
  id: string;
  code: string;
  scope: 'admin' | 'pos' | 'dashboard';
  name: string;
  description: string;
};

export type AdminPermissionSummary = Pick<AdminPermission, 'id' | 'code' | 'name'>;
export type AdminRoleSummary = {
  id: string;
  code?: string;
  name: string;
};

export type KitchenTicketStatus = 'new' | 'cooking' | 'done';
export type KitchenTicketRouteMode = 'display' | 'printer' | 'both';
export type AdminDeviceMode = 'admin' | 'waiter' | 'cashier' | 'kitchen_display' | 'owner_dashboard';
export type AdminDistributionPointKind = 'hall' | 'online' | 'takeaway' | 'delivery';
export type AdminFeatureOrderEntryMode = 'hall' | 'cashier_builder';
export type AdminFeatureKitchenMode = 'display' | 'printer' | 'both';
export type AdminDiningTableShape = 'square' | 'rectangle' | 'round' | 'oval';
export type AdminTableShapeVariant =
  | 'seat2_horizontal'
  | 'seat2_vertical'
  | 'seat3_triangle'
  | 'seat4_square'
  | 'seat4_horizontal'
  | 'seat4_vertical'
  | 'seat5_horizontal'
  | 'seat5_vertical'
  | 'seat6_horizontal'
  | 'seat6_vertical';
export type AdminDiningTableStatus = 'available' | 'occupied' | 'reserved' | 'blocked';
export type AdminLayoutObjectKind = 'table' | 'bar' | 'cash_desk' | 'door' | 'wall' | 'decor' | 'label';
export type AdminTableSessionStatus = 'open' | 'pending_payment' | 'closed' | 'merged';
export type AdminOrderStatus = 'open' | 'submitted' | 'ready' | 'closed' | 'cancelled';
export type AdminOrderChannel = 'hall' | 'takeaway' | 'online' | 'delivery';
export type AdminOrderItemStatus = 'new' | 'cooking' | 'done' | 'served' | 'cancelled';
export type AdminPaymentMethod = 'cash' | 'card' | 'qr' | 'mixed';
export type AdminPaymentStatus = 'pending' | 'succeeded' | 'failed';
export type AdminReceiptKind = 'prebill' | 'fiscal' | 'refund';
export type AdminReceiptStatus = 'created' | 'sent' | 'failed';
export type AdminCashShiftStatus = 'open' | 'closed';
export type AdminReportKey =
  | 'summary'
  | 'sales'
  | 'openChecks'
  | 'topItems'
  | 'topStaff'
  | 'paymentBreakdown'
  | 'shifts';
export type AdminReportPeriodType = 'day' | 'month' | 'year';
export type AdminBusinessPartnerStatus = 'draft' | 'active' | 'inactive';
export type AdminTariffClassification = 'basic' | 'standard' | 'premium' | 'custom';

export type AdminHall = {
  id: string;
  name: string;
  description?: string;
  gridColumns?: number;
  sortOrder?: number;
  isActive: boolean;
};

export type AdminHallPayload = {
  name: string;
  description: string;
  gridColumns?: number;
  sortOrder: number;
  isActive: boolean;
};

export type AdminZoneOrCabin = {
  id: string;
  hall: string;
  hallName?: string | null;
  name: string;
  isPrivate: boolean;
  sortOrder: number;
  isActive: boolean;
};

export type AdminZoneOrCabinPayload = {
  hall: string;
  name: string;
  isPrivate: boolean;
  sortOrder: number;
  isActive: boolean;
};

export type AdminActiveTableSessionSummary = {
  id: string;
  guestCount: number;
  status: AdminTableSessionStatus;
  assignedWaiterId?: string | null;
  createdAt: string;
  serviceState: string;
};

export type AdminDiningTable = {
  id: string;
  hall: string;
  hallName?: string | null;
  name: string;
  tableNumber: number;
  seatCount: number;
  shape: AdminDiningTableShape;
  shapeVariant?: AdminTableShapeVariant;
  status: AdminDiningTableStatus;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
  isActive: boolean;
  activeSession?: AdminActiveTableSessionSummary | null;
};

export type AdminDiningTablePayload = {
  hall: string;
  name: string;
  tableNumber: number;
  seatCount: number;
  shape: AdminDiningTableShape;
  shapeVariant?: AdminTableShapeVariant;
  status: AdminDiningTableStatus;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  rotation: number;
  isActive: boolean;
};

export type AdminHallConstructorTable = {
  id: string;
  name: string;
  tableNumber: number;
  seatCount: number;
  shapeVariant: AdminTableShapeVariant;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  isActive: boolean;
};

export type AdminHallConstructor = {
  hallId: string;
  hallName: string;
  gridColumns: number;
  tables: AdminHallConstructorTable[];
};

export type AdminHallConstructorPayload = {
  gridColumns: number;
  tables: Array<{
    id?: string;
    name: string;
    tableNumber: number;
    seatCount: number;
    shapeVariant: AdminTableShapeVariant;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    isActive?: boolean;
  }>;
  deletedTableIds?: string[];
};

export type AdminTableSession = {
  id: string;
  hall: string;
  hallName?: string | null;
  table: string;
  tableName?: string | null;
  openedBy?: string | null;
  openedByName?: string | null;
  assignedWaiter?: string | null;
  assignedWaiterName?: string | null;
  guestCount: number;
  status: AdminTableSessionStatus;
  note: string;
  mergedInto?: string | null;
  closedAt?: string | null;
  createdAt: string;
};

export type AdminTableSessionPayload = {
  hall: string;
  table: string;
  openedBy?: string | null;
  assignedWaiter?: string | null;
  guestCount: number;
  status: AdminTableSessionStatus;
  note: string;
  mergedInto?: string | null;
  closedAt?: string | null;
};

export type AdminBranch = {
  id: string;
  restaurant?: string | null;
  restaurantName?: string | null;
  name: string;
  address: string;
  phone: string;
  serviceFeePercent: number;
  legalName: string;
  taxNumber: string;
  vatEnabled: boolean;
  isDefault: boolean;
};

export type AdminBranchPayload = {
  name: string;
  address: string;
  phone: string;
  serviceFeePercent: number;
  legalName: string;
  taxNumber: string;
  vatEnabled: boolean;
  isDefault: boolean;
};

export type AdminCashDesk = {
  id: string;
  name: string;
  location: string;
  enabledPaymentMethods: AdminPaymentMethod[];
  fiscalProvider: string;
  receiptPrinterEnabled: boolean;
  terminalId: string;
  externalCashboxId: string;
  isActive: boolean;
};

export type AdminCashDeskPayload = {
  name: string;
  location: string;
  enabledPaymentMethods: AdminPaymentMethod[];
  fiscalProvider: string;
  receiptPrinterEnabled: boolean;
  terminalId: string;
  externalCashboxId: string;
  isActive: boolean;
};

export type AdminDevice = {
  id: string;
  name: string;
  mode: AdminDeviceMode;
  primaryHallId?: string | null;
  primaryHallName?: string | null;
  allowedHallIds?: string[];
  isActive: boolean;
};

export type AdminDevicePayload = {
  name: string;
  mode: AdminDeviceMode;
  primaryHallId?: string | null;
  allowedHallIds?: string[];
  isActive: boolean;
};

export type AdminDistributionPoint = {
  id: string;
  name: string;
  kind: AdminDistributionPointKind;
  integrationChannel: string;
  assignedHall?: string | null;
  assignedHallName?: string | null;
  isActive: boolean;
};

export type AdminDistributionPointPayload = {
  name: string;
  kind: AdminDistributionPointKind;
  integrationChannel: string;
  assignedHall?: string | null;
  isActive: boolean;
};

export type AdminFeatureConfig = {
  id: string;
  restaurant?: string | null;
  restaurantName?: string | null;
  hallEnabled: boolean;
  kitchenEnabled: boolean;
  cashierEnabled: boolean;
  ownerDashboardEnabled: boolean;
  orderEntryMode: AdminFeatureOrderEntryMode;
  kitchenMode: AdminFeatureKitchenMode;
  enabledModules: string[];
  enabledRoles: string[];
  enabledRoleDetails?: AdminRoleSummary[];
};

export type AdminFeatureConfigPayload = {
  restaurant?: string;
  hallEnabled: boolean;
  kitchenEnabled: boolean;
  cashierEnabled: boolean;
  ownerDashboardEnabled: boolean;
  orderEntryMode: AdminFeatureOrderEntryMode;
  kitchenMode: AdminFeatureKitchenMode;
  enabledModules: string[];
  enabledRoles: string[];
};

export type AdminPrepStation = {
  id: string;
  name: string;
  kind: 'kitchen' | 'bar' | 'other';
  isActive: boolean;
};

export type AdminPrepStationPayload = {
  name: string;
  kind: 'kitchen' | 'bar' | 'other';
  isActive: boolean;
};

export type AdminRestaurant = {
  id: string;
  businessPartnerId?: string | null;
  businessPartnerName?: string | null;
  name: string;
  legalName: string;
  taxNumber: string;
  phone: string;
  address: string;
  currency: string;
  authCode?: string;
  isActive: boolean;
  branches?: AdminBranch[];
};

export type AdminRestaurantPayload = {
  name: string;
  legalName: string;
  taxNumber: string;
  phone: string;
  address: string;
  isActive: boolean;
};

export type AdminBusinessPartner = {
  id: string;
  inn: string;
  companyName: string;
  legalName: string;
  directorName: string;
  phone: string;
  email: string;
  address: string;
  status: AdminBusinessPartnerStatus;
  ownerUserId?: string | null;
  activatedAt?: string | null;
  deactivatedAt?: string | null;
  fakturaPayload?: Record<string, unknown>;
};

export type AdminBusinessPartnerPayload = {
  inn: string;
  companyName: string;
  legalName: string;
  directorName: string;
  phone: string;
  email: string;
  address: string;
  fakturaPayload?: Record<string, unknown>;
};

export type AdminBusinessPartnerLookupResult = {
  inn: string;
  companyName: string;
  legalName: string;
  directorName: string;
  phone: string;
  email: string;
  address: string;
  fakturaPayload: Record<string, unknown>;
};

export type AdminTariff = {
  id: string;
  name: string;
  classification: AdminTariffClassification;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isActive: boolean;
  operationalSettings?: Record<string, unknown>;
  permissions: AdminPermissionSummary[];
  allowedRoles: AdminRoleSummary[];
};

export type AdminTariffPayload = {
  name: string;
  classification: AdminTariffClassification;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isActive: boolean;
  operationalSettings?: Record<string, unknown>;
  permissionIds?: string[];
  allowedRoleIds?: string[];
};

export type AdminGeneratedCredentials = {
  username: string;
  password: string;
};

export type AdminPartnerActivationResult = AdminGeneratedCredentials & {
  partner: AdminBusinessPartner;
};

export type AdminRestaurantActivationPayload = {
  tariffId?: string | null;
  customTariff?: boolean;
  monthlyPrice?: number | null;
  yearlyPrice?: number | null;
  startsOn: string;
  permissionIds?: string[];
  allowedRoleIds?: string[];
  operationalSettings?: Record<string, unknown>;
};

export type AdminRestaurantActivationResult = AdminGeneratedCredentials & {
  restaurant: AdminRestaurant;
};

export type AdminKitchenTicketItem = {
  id: string;
  order: string;
  catalogItem: string;
  catalogItemName: string;
  prepStation: string;
  prepStationName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  status: string;
  note: string;
  createdAt: string;
};

export type AdminKitchenTicket = {
  id: string;
  order: string;
  orderNumber: number;
  prepStation: string;
  prepStationName: string;
  status: KitchenTicketStatus;
  routedVia: KitchenTicketRouteMode;
  isPrinted: boolean;
  printedPayload: Record<string, unknown>;
  hallName: string;
  tableName: string;
  waiterName: string;
  items: AdminKitchenTicketItem[];
  completedAt: string | null;
  createdAt: string;
};

export type AdminOrderItemNote = {
  id: string;
  orderItemId: string;
  orderId: string;
  orderNumber: number;
  catalogItemName: string;
  tableName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminOrderItem = {
  id: string;
  order: string;
  orderNumber: number;
  catalogItem: string;
  catalogItemName: string;
  prepStation?: string | null;
  prepStationName?: string | null;
  createdBy?: string | null;
  createdByName?: string | null;
  tableName?: string | null;
  hallName?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  status: AdminOrderItemStatus;
  note: string;
  notesCount: number;
  notes: AdminOrderItemNote[];
  createdAt: string;
  updatedAt: string;
};

export type AdminPayment = {
  id: string;
  order: string;
  orderNumber: number;
  cashDesk?: string | null;
  cashDeskName?: string | null;
  cashShiftId?: string | null;
  receivedBy?: string | null;
  receivedByName?: string | null;
  method: AdminPaymentMethod;
  amount: number;
  status: AdminPaymentStatus;
  externalRef: string;
  providerPayload: Record<string, unknown>;
  refundsTotal?: number;
  isRefunded?: boolean;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminReceipt = {
  id: string;
  order: string;
  orderNumber: number;
  payment?: string | null;
  paymentMethod?: AdminPaymentMethod | null;
  paymentAmount?: number | null;
  kind: AdminReceiptKind;
  status: AdminReceiptStatus;
  provider: string;
  payload: Record<string, unknown>;
  reprintCount?: number;
  lastReprintedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminCashShiftReportRow = {
  id: string;
  status: AdminCashShiftStatus;
  openedAt: string;
  closedAt?: string | null;
  openingCashAmount: number;
  actualClosingCashAmount: number;
  expectedClosingCashAmount: number;
  cashDifferenceAmount: number;
  cashTotal: number;
  cardTotal: number;
  qrTotal: number;
  refundTotal: number;
  receiptCount: number;
  reprintCount: number;
  cashierId?: string | null;
  cashierName?: string | null;
  cashDeskId?: string | null;
  cashDeskName?: string | null;
};

export type AdminOrder = {
  id: string;
  tableSession?: string | null;
  tableId?: string | null;
  tableName?: string | null;
  hallName?: string | null;
  distributionPoint?: string | null;
  distributionPointName?: string | null;
  openedBy?: string | null;
  openedByName?: string | null;
  cashier?: string | null;
  cashierName?: string | null;
  orderNumber: number;
  channel: AdminOrderChannel;
  status: AdminOrderStatus;
  guestCount: number;
  note: string;
  subtotal: number;
  serviceFee: number;
  total: number;
  closedAt: string | null;
  itemsCount: number;
  paymentsCount: number;
  receiptsCount: number;
  items: AdminOrderItem[];
  payments: AdminPayment[];
  receipts: AdminReceipt[];
  createdAt: string;
  updatedAt: string;
};

export type AdminRole = {
  id: string;
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: AdminPermission[];
};

export type AdminRolePayload = {
  name: string;
  description: string;
  permissionIds: string[];
};

export type CatalogCategory = {
  id: string;
  name: string;
  mxikCode: string;
  mxikName?: string;
  imageUrl?: string | null;
  imageSource?: 'mxik-cache' | 'manual' | null;
  sortOrder: number;
  isActive: boolean;
};

export type CatalogCategoryPayload = {
  name: string;
  mxikCode: string;
  mxikName?: string;
  sortOrder: number;
  isActive: boolean;
};

export type AdminMxikLookupResult = {
  code: string;
  name: string;
  label: string;
  raw?: Record<string, unknown>;
};

export type CatalogItem = {
  id: string;
  category?: string | null;
  categoryName?: string | null;
  prepStation?: string | null;
  prepStationName?: string | null;
  name: string;
  mxikCode?: string;
  mxikName?: string;
  description: string;
  price: number;
  isActive: boolean;
  isStoplisted: boolean;
};

export type CatalogItemPayload = {
  category?: string | null;
  prepStation?: string | null;
  name: string;
  mxikCode?: string;
  mxikName?: string;
  description: string;
  price: number;
  isActive: boolean;
  isStoplisted: boolean;
};

export type AdminUser = {
  id: string;
  username: string;
  fullName: string;
  phone: string;
  isActive: boolean;
  restaurantAccessActive?: boolean;
  employmentStatus?: 'active' | 'inactive' | 'archived';
  passportSeries?: string;
  pnfl?: string;
  birthDate?: string | null;
  salaryType?: 'hourly' | 'daily' | 'kpi' | null;
  baseAmount?: number | null;
  kpiPercent?: number | null;
  isSuperuser?: boolean;
  role: AdminRole | null;
  businessPartnerId?: string | null;
  restaurantId?: string | null;
  hallSwitchPermission?: boolean;
  primaryHallId?: string | null;
  allowedHallIds?: string[];
  permissionCodes: string[];
};

export type AdminSessionUser = AdminUser;

export type AdminUserPayload = {
  username?: string;
  fullName: string;
  phone: string;
  isActive: boolean;
  employmentStatus?: 'active' | 'inactive' | 'archived';
  passportSeries?: string;
  pnfl?: string;
  birthDate?: string | null;
  salaryType?: 'hourly' | 'daily' | 'kpi' | null;
  baseAmount?: number | null;
  kpiPercent?: number | null;
  roleId: string;
  hallSwitchPermission?: boolean;
  primaryHallId?: string | null;
  allowedHallIds?: string[];
  password?: string;
  pin?: string;
};

export type AdminLoginRequest = {
  username: string;
  password: string;
};

export type AdminLoginResponse = {
  token: string;
  user: AdminSessionUser;
};

export type AdminReportSummary = {
  salesTotal: number;
  ordersCount: number;
  averageCheck: number;
  openChecks: number;
  activeTables: number;
};

export type AdminSalesReportRow = {
  method: AdminPaymentMethod;
  count: number;
  total: number;
};

export type AdminOpenChecksReportRow = {
  id: string;
  orderNumber: number;
  status: AdminOrderStatus;
  total: number;
  hallName?: string | null;
  tableName?: string | null;
  createdAt: string;
};

export type AdminTopItemsReportRow = {
  catalogItemId?: string | null;
  catalogItemName: string;
  categoryId?: string | null;
  categoryName?: string | null;
  quantity: number;
  revenue: number;
};

export type AdminTopStaffReportRow = {
  staffId?: string | null;
  staffName?: string | null;
  orderCount: number;
  totalSales: number;
};

export type AdminPaymentBreakdownReportRow = AdminSalesReportRow;
export type AdminShiftReportRow = AdminCashShiftReportRow;

export type AdminReportExportFile = {
  blob: Blob;
  filename: string;
};

export type AdminPaginatedResponse<T> = {
  page: number;
  pageSize: number;
  count: number;
  total: number;
  pagesCount: number;
  data: T[];
};

export type AdminCollectionResponse<T> = {
  total?: number;
  data: T[];
};

export type AdminListQueryParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
};

export type AdminReportPeriodQueryParams = {
  periodType?: AdminReportPeriodType;
  date?: string;
  month?: string;
  year?: string;
};

export type AdminUsersQueryParams = AdminListQueryParams & {
  roleIdIn?: string;
  employmentStatusIn?: string;
};

export type AdminEmployeesQueryParams = AdminUsersQueryParams;

export type AdminRolesQueryParams = AdminListQueryParams & {
  typeIn?: string;
};

export type AdminPermissionsQueryParams = AdminListQueryParams & {
  scopeIn?: string;
  actionIn?: string;
};

export type AdminKitchenTicketsQueryParams = AdminListQueryParams & {
  statusIn?: string;
  prepStationIdIn?: string;
  routedViaIn?: string;
  isPrinted?: boolean;
};

export type AdminOrdersQueryParams = AdminListQueryParams & {
  statusIn?: string;
  channelIn?: string;
};

export type AdminOrderItemsQueryParams = AdminListQueryParams & {
  statusIn?: string;
};

export type AdminOrderItemNotesQueryParams = AdminListQueryParams;

export type AdminPaymentsQueryParams = AdminListQueryParams & {
  statusIn?: string;
  methodIn?: string;
};

export type AdminReceiptsQueryParams = AdminListQueryParams & {
  statusIn?: string;
  kindIn?: string;
};

export type AdminCatalogCategoriesQueryParams = AdminListQueryParams & {
  isActive?: boolean;
};

export type AdminCatalogItemsQueryParams = AdminListQueryParams & {
  categoryIdIn?: string;
  isActive?: boolean;
  isStoplisted?: boolean;
};

export type AdminHallsQueryParams = AdminListQueryParams & {
  isActive?: boolean;
};

export type AdminZonesQueryParams = AdminListQueryParams & {
  hallIdIn?: string;
  isPrivate?: boolean;
  isActive?: boolean;
};

export type AdminDiningTablesQueryParams = AdminListQueryParams & {
  hallIdIn?: string;
  shapeIn?: string;
  statusIn?: string;
};

export type AdminTableSessionsQueryParams = AdminListQueryParams & {
  hallIdIn?: string;
  statusIn?: string;
};

export type AdminCashDesksQueryParams = AdminListQueryParams & {
  isActive?: boolean;
};

export type AdminDevicesQueryParams = AdminListQueryParams & {
  modeIn?: string;
  isActive?: boolean;
};

export type AdminDistributionPointsQueryParams = AdminListQueryParams & {
  kindIn?: string;
  isActive?: boolean;
};

export type AdminFeatureConfigsQueryParams = AdminListQueryParams & {
  orderEntryModeIn?: string;
  kitchenModeIn?: string;
};

export type AdminPrepStationsQueryParams = AdminListQueryParams & {
  kindIn?: string;
  isActive?: boolean;
};

export type AdminRestaurantsQueryParams = AdminListQueryParams & {
  isActive?: boolean;
};

export type AdminBusinessPartnersQueryParams = AdminListQueryParams & {
  isActive?: boolean;
};

export type AdminTariffsQueryParams = AdminListQueryParams & {
  isActive?: boolean;
};

export type AdminSummaryReportQueryParams = AdminReportPeriodQueryParams;

export type AdminSalesReportQueryParams = AdminListQueryParams &
  AdminReportPeriodQueryParams & {
    paymentMethod?: string;
  };

export type AdminOpenChecksReportQueryParams = AdminListQueryParams &
  AdminReportPeriodQueryParams & {
    status?: string;
    hallId?: string;
  };

export type AdminTopItemsReportQueryParams = AdminListQueryParams &
  AdminReportPeriodQueryParams & {
    categoryId?: string;
  };

export type AdminTopStaffReportQueryParams = AdminListQueryParams & AdminReportPeriodQueryParams;

export type AdminPaymentBreakdownReportQueryParams = AdminListQueryParams &
  AdminReportPeriodQueryParams & {
    paymentMethod?: string;
  };

export type AdminShiftReportQueryParams = AdminListQueryParams &
  AdminReportPeriodQueryParams & {
    cashDeskId?: string;
    cashierId?: string;
    status?: string;
    differenceOnly?: boolean;
  };
