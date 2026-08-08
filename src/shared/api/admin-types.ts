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
export type AdminDistributionPointKind = 'hall' | 'online' | 'takeaway' | 'delivery';
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
export type AdminTableSessionStatus = 'open' | 'pending_payment' | 'closed' | 'merged';
export type AdminOrderStatus = 'open' | 'submitted' | 'ready' | 'closed' | 'cancelled';
export type AdminOrderChannel = 'hall' | 'takeaway' | 'online' | 'delivery';
export type AdminOrderItemStatus = 'new' | 'cooking' | 'done' | 'served' | 'cancelled';
export type AdminPaymentMethod = 'cash' | 'card' | 'qr' | 'mixed';
export type AdminPaymentStatus = 'pending' | 'succeeded' | 'failed';
export type AdminReceiptKind = 'plain' | 'prebill' | 'fiscal' | 'refund';
export type AdminReceiptStatus = 'created' | 'sent' | 'failed';
export type AdminCashShiftStatus = 'open' | 'closed';
export type AdminCashExpenseStatus = 'posted' | 'voided';

export type AdminExpenseCategory = {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminCashExpense = {
  id: string;
  restaurantName?: string | null;
  cashShiftId: string;
  cashDesk: string;
  cashDeskName: string;
  category: string;
  categoryName: string;
  amount: number;
  comment: string;
  recipient?: string | null;
  recipientName: string;
  createdBy: string;
  createdByName: string;
  status: AdminCashExpenseStatus;
  occurredAt: string;
  voidedAt?: string | null;
  voidedBy?: string | null;
  voidedByName?: string | null;
  voidReason: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminCashExpensesQueryParams = AdminListQueryParams & {
  statusIn?: string;
  categoryIdIn?: string;
  cashDeskId?: string;
  recipientId?: string;
  createdById?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type AdminCashExpensesResponse = AdminPaginatedResponse<AdminCashExpense> & {
  postedTotal: number;
};
export type AdminReportKey = 'summary' | 'sales' | 'receipts' | 'topItems' | 'topStaff' | 'paymentBreakdown' | 'shifts';
export type AdminReportPeriodType = 'day' | 'month' | 'year';
export type AdminBusinessPartnerStatus = 'draft' | 'active' | 'inactive';
export type AdminBillingPeriod = 'monthly' | 'yearly';
export type AdminBusinessPartnerRestaurant = {
  id: string;
  name: string;
};

export type AdminZoneOrCabinSummary = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type AdminHall = {
  id: string;
  restaurantName?: string | null;
  name: string;
  description?: string;
  gridColumns?: number;
  sortOrder?: number;
  isActive: boolean;
  zoneOrCabinId: string;
  zoneOrCabin?: AdminZoneOrCabinSummary | null;
};

export type AdminHallPayload = {
  name: string;
  description: string;
  gridColumns?: number;
  sortOrder?: number;
  isActive: boolean;
  zoneOrCabinId: string;
};

export type AdminZoneOrCabin = {
  id: string;
  restaurantName?: string | null;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type AdminZoneOrCabinPayload = {
  name: string;
  sortOrder?: number;
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
  restaurantName?: string | null;
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
  restaurantName?: string | null;
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
  restaurantName?: string | null;
  fiscalIntegration?: string | null;
  fiscalIntegrationName?: string;
  paymentIntegration?: string | null;
  paymentIntegrationName?: string;
  printerIntegration?: string | null;
  printerIntegrationName?: string | null;
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
  fiscalIntegration?: string | null;
  paymentIntegration?: string | null;
  printerIntegration?: string | null;
  location?: string;
  enabledPaymentMethods?: AdminPaymentMethod[];
  fiscalProvider?: string;
  receiptPrinterEnabled?: boolean;
  terminalId?: string;
  externalCashboxId?: string;
  isActive?: boolean;
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

export type AdminPrepStation = {
  id: string;
  restaurantName?: string | null;
  name: string;
  kind: 'kitchen' | 'bar' | 'other';
  printerIntegration?: string | null;
  printerIntegrationName?: string | null;
  cooks?: Array<{ id: string; fullName?: string; username?: string }>;
  isActive: boolean;
};

export type AdminPrepStationPayload = {
  name: string;
  kind: 'kitchen' | 'bar' | 'other';
  printerIntegration?: string | null;
  cookIds?: string[];
  isActive: boolean;
};

export type AdminIntegrationConfigKind = 'fiscal' | 'payment' | 'printer';

export type AdminIntegrationConfig = {
  id: string;
  restaurantName?: string | null;
  kind: AdminIntegrationConfigKind;
  provider: string;
  displayName?: string;
  isEnabled: boolean;
  settings: Record<string, unknown>;
};

export type AdminIntegrationConfigPayload = {
  kind: AdminIntegrationConfigKind;
  provider: string;
  isEnabled: boolean;
  settings: Record<string, unknown>;
};

export type AdminFiscalDevice = {
  factoryId: string;
  terminalId: string;
  readerName: string;
  description: string;
  appletVersion: string;
  locked: boolean;
  posLocked: boolean;
  posAuth: boolean;
  endpointUrl: string;
};

export type AdminRestaurantTariff = {
  id: string;
  name: string;
  permissionCodes: string[];
  roleCodes: string[];
};

export type AdminRestaurantActiveUser = {
  id: string;
  fullName: string;
  username: string;
  role: AdminRoleSummary | null;
};

export type AdminRestaurantSoliqSummary = {
  configured: boolean;
  isEnabled: boolean;
  provider: string;
  terminalId?: string | null;
  cashboxId?: string | null;
  taxNumber?: string | null;
  endpointUrl?: string | null;
};

export type AdminRestaurantBalanceSummary = {
  currentBalance: number;
  nextChargeAmount?: number | null;
  nextChargeOn?: string | null;
  nextPeriodStatus?: 'active' | 'inactive' | null;
  lastTopUpAt?: string | null;
};

export type AdminRestaurantBalanceTransactionActor = {
  id: string;
  fullName: string;
  username: string;
};

export type AdminRestaurantBalanceTransaction = {
  id: string;
  kind: 'top_up' | 'renewal_charge';
  amount: number;
  balanceAfter: number;
  performedBy?: AdminRestaurantBalanceTransactionActor | null;
  note: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  createdAt: string;
};

export type AdminPosMonitorVariant = 'default' | 'light_compact';

export type AdminRestaurant = {
  id: string;
  parentId?: string | null;
  parentName?: string | null;
  businessPartnerId?: string | null;
  businessPartnerName?: string | null;
  name: string;
  legalName: string;
  taxNumber: string;
  phone: string;
  social?: string | null;
  address: string;
  fakturaPayload?: Record<string, unknown>;
  currency: string;
  authCode?: string;
  posAuthBackgroundImageUrl?: string | null;
  serviceFeeEnabled: boolean;
  serviceFeePercent: number | string;
  vatEnabled: boolean;
  vatPercent: number | string;
  markingCheckEnabled: boolean;
  posMonitorVariant?: AdminPosMonitorVariant;
  isActive: boolean;
  activatedAt?: string | null;
  deactivatedAt?: string | null;
  activationType?: 'tariff' | 'custom' | null;
  startsOn?: string | null;
  expiresOn?: string | null;
  billingPeriod?: AdminBillingPeriod | null;
  restaurantAccessActive?: boolean;
  permissionCodes?: string[];
  roleCodes?: string[];
  tariff?: AdminRestaurantTariff | null;
  branches?: AdminBranch[];
};

export type AdminRestaurantDetail = AdminRestaurant & {
  activeUsers: AdminRestaurantActiveUser[];
  soliqIntegration?: AdminRestaurantSoliqSummary | null;
  balance: AdminRestaurantBalanceSummary;
};

export type AdminRestaurantPayload = {
  name: string;
  legalName: string;
  taxNumber: string;
  phone: string;
  social: string;
  address: string;
  fakturaPayload?: Record<string, unknown>;
  posAuthBackgroundImage?: File | null;
  clearPosAuthBackgroundImage?: boolean;
  serviceFeeEnabled: boolean;
  serviceFeePercent: number | string;
  vatEnabled: boolean;
  vatPercent: number | string;
  markingCheckEnabled: boolean;
  posMonitorVariant?: AdminPosMonitorVariant;
  isActive: boolean;
  tariffId?: string | null;
};

export type AdminRestaurantBranchCreatePayload = AdminRestaurantPayload & {
  copyCatalog: boolean;
  copySettings: boolean;
};

export type AdminRestaurantLookupResult = {
  taxNumber: string;
  name: string;
  legalName: string;
  phone: string;
  address: string;
  fakturaPayload: Record<string, unknown>;
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
  customTariffAllowed: boolean;
  restaurants?: AdminBusinessPartnerRestaurant[];
  restaurantsCount?: number;
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
  customTariffAllowed?: boolean;
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
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isActive: boolean;
  permissions: AdminPermissionSummary[];
  allowedRoles: AdminRoleSummary[];
};

export type AdminTariffPayload = {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  isActive: boolean;
  allowedRoleIds: string[];
  permissionIds?: string[];
};

export type AdminTariffOption = Pick<
  AdminTariff,
  'id' | 'name' | 'description' | 'monthlyPrice' | 'yearlyPrice' | 'permissions' | 'allowedRoles'
>;

export type AdminRestaurantActivationOptions = {
  tariffs: AdminTariffOption[];
  roles: AdminRole[];
  permissions: AdminPermission[];
  customTariffAllowed: boolean;
};

export type AdminGeneratedCredentials = {
  username: string;
  password: string;
};

export type AdminPartnerActivationDefaults = AdminGeneratedCredentials;

export type AdminPartnerActivationResult = AdminGeneratedCredentials & {
  partner: AdminBusinessPartner;
};

export type AdminRestaurantActivationPayload = {
  activationType?: 'tariff' | 'custom';
  billingPeriod: AdminBillingPeriod;
  monthlyPrice?: number;
  yearlyPrice?: number;
  tariffId?: string;
  allowedRoleIds?: string[];
  permissionIds?: string[];
  startsOn: string;
};

export type AdminRestaurantActivationResult = AdminGeneratedCredentials & {
  restaurant: AdminRestaurant;
};

export type AdminRestaurantTopUpPayload = {
  amount: number;
  note?: string;
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
  restaurantName?: string | null;
  order: string;
  orderNumber: number;
  orderDisplayName?: string | null;
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
  restaurantName?: string | null;
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
  restaurantName?: string | null;
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
  restaurantName?: string | null;
  order: string;
  orderNumber: number;
  orderDisplayName?: string | null;
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
  restaurantName?: string | null;
  order: string;
  orderNumber: number;
  orderDisplayName?: string | null;
  payment?: string | null;
  paymentMethod?: AdminPaymentMethod | null;
  paymentAmount?: number | null;
  kind: AdminReceiptKind;
  status: AdminReceiptStatus;
  provider: string;
  payload: Record<string, unknown>;
  printDocument?: string | null;
  printLayout?: Record<string, unknown> | null;
  printDataSnapshot?: Record<string, unknown> | null;
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
  expenseTotal: number;
  precheckCount: number;
  receiptCount: number;
  reprintCount: number;
  cashierId?: string | null;
  cashierName?: string | null;
  cashDeskId?: string | null;
  cashDeskName?: string | null;
};

export type AdminOrder = {
  id: string;
  restaurantName?: string | null;
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
  displayName?: string | null;
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
  restaurantName?: string | null;
  name: string;
  mxikCode: string;
  mxikName?: string;
  mxikPayload?: Record<string, unknown>;
  prepStation?: string | null;
  prepStationName?: string | null;
  imageUrl?: string | null;
  imageSource?: CatalogImageSource | null;
  sortOrder: number;
  isActive: boolean;
};

export type CatalogImageSource = 'mxik-cache' | 'manual';

export type CatalogCategoryPayload = {
  name: string;
  mxikCode: string;
  mxikName?: string;
  mxikPayload?: Record<string, unknown>;
  prepStation?: string | null;
  imageUrl?: string | null;
  imageSource?: CatalogImageSource | '';
  imageFile?: File | null;
  clearImage?: boolean;
  restoreMxikImage?: boolean;
  sortOrder?: number;
  isActive: boolean;
};

export type AdminMxikLookupResult = {
  code: string;
  name: string;
  label: string;
  raw?: Record<string, unknown>;
};

export type AdminMxikPackage = {
  code: string;
  name: string;
  unitName?: string;
  containerName?: string;
  parentCode?: string;
  isUnitPackage?: string;
  raw?: Record<string, unknown>;
};

export type AdminMxikDetails = {
  code: string;
  name: string;
  shortName?: string;
  unitName?: string;
  commonUnitName?: string;
  useCard?: number | null;
  cashSale?: number | null;
  labelStatus?: number | null;
  primaryPackage?: AdminMxikPackage | null;
  packages: AdminMxikPackage[];
  raw?: Record<string, unknown>;
};

export type CatalogItem = {
  id: string;
  restaurantName?: string | null;
  category?: string | null;
  categoryName?: string | null;
  prepStation?: string | null;
  prepStationName?: string | null;
  name: string;
  mxikCode?: string;
  mxikName?: string;
  mxikPayload?: Record<string, unknown>;
  imageUrl?: string | null;
  imageSource?: CatalogImageSource | null;
  requiresMarking?: boolean;
  markingGtin?: string | null;
  description: string;
  price: number;
  sortOrder: number;
  modifierGroups?: string[];
  isActive: boolean;
  isStoplisted: boolean;
};

export type CatalogItemPayload = {
  category?: string | null;
  prepStation?: string | null;
  name: string;
  mxikCode?: string;
  mxikName?: string;
  mxikPayload?: Record<string, unknown>;
  imageUrl?: string | null;
  imageSource?: CatalogImageSource | '';
  imageFile?: File | null;
  clearImage?: boolean;
  restoreMxikImage?: boolean;
  description: string;
  price: number;
  sortOrder?: number;
  modifierGroups?: string[];
  isActive: boolean;
  isStoplisted: boolean;
};

export type CatalogItemGroupMember = {
  id: string;
  catalogItem: string;
  catalogItemName: string;
  variantName: string;
  price: number;
  isActive: boolean;
  isStoplisted: boolean;
  sortOrder: number;
};

export type CatalogItemGroup = {
  id: string;
  category: string;
  categoryName: string;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  members: CatalogItemGroupMember[];
};

export type CatalogItemGroupPayload = {
  category: string;
  name: string;
  description: string;
  sortOrder?: number;
  isActive: boolean;
  members: Array<{
    catalogItem: string;
    variantName: string;
    sortOrder: number;
  }>;
};

export type CatalogModifierOption = {
  id: string;
  name: string;
  priceDelta: number;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
};

export type CatalogModifierGroup = {
  id: string;
  restaurantName?: string | null;
  name: string;
  selectionType: 'single' | 'multiple';
  minSelections: number;
  maxSelections: number;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
  options: CatalogModifierOption[];
  createdAt?: string;
  updatedAt?: string;
};

export type CatalogModifierOptionPayload = {
  id?: string;
  name: string;
  priceDelta: number;
  isDefault: boolean;
  sortOrder: number;
  isActive: boolean;
};

export type CatalogModifierGroupPayload = {
  name: string;
  selectionType: 'single' | 'multiple';
  minSelections: number;
  maxSelections: number;
  sortOrder: number;
  isActive: boolean;
  options: CatalogModifierOptionPayload[];
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
  salaryType?: 'hourly' | 'daily' | 'monthly' | null;
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
  businessPartnersCount?: number | null;
  companyName?: string | null;
  inn?: string | null;
  restaurantName?: string | null;
  activatedAt?: string | null;
  expiresOn?: string | null;
  billingPeriod?: AdminBillingPeriod | null;
  activationType?: 'tariff' | 'custom' | null;
  tariff?: AdminRestaurantTariff | null;
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
  salaryType?: 'hourly' | 'daily' | 'monthly' | null;
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
  grossSalesTotal: number;
  refundsTotal: number;
  salesTotal: number;
  ordersCount: number;
  averageCheck: number;
  prechecksCount: number;
  receiptsCount: number;
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

export type AdminReceiptsReportRow = {
  id: string;
  orderNumber: number;
  kind: 'plain' | 'fiscal';
  status: AdminReceiptStatus;
  amount: number;
  paymentMethod?: AdminPaymentMethod | null;
  cashierName?: string | null;
  cashDeskName?: string | null;
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
  itemsCount?: number;
  items_count?: number;
  totalSales: number;
};

export type AdminPaymentBreakdownReportRow = AdminSalesReportRow;
export type AdminShiftReportRow = AdminCashShiftReportRow;

export type AdminReportExportFile = {
  blob: Blob;
  filename: string;
};

export type AdminLocalAgentStatus = 'online' | 'offline';

export type AdminLocalAgent = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  status: AdminLocalAgentStatus;
  online: boolean;
  version: string;
  lastSeenAt?: string | null;
  capabilities: string[];
  lanEndpoints: string[];
  protocolVersion: number;
  isActive: boolean;
};

export type AdminLocalAgentDiagnostics = {
  ok: boolean;
  agent: AdminLocalAgent;
  status: {
    agent?: Record<string, unknown>;
    backend?: Record<string, unknown>;
    sync?: Record<string, unknown>;
    fiscal?: Record<string, unknown>;
    marta?: Record<string, unknown>;
    printer?: Record<string, unknown>;
    alerts?: Array<Record<string, unknown>>;
  };
  update: {
    status: 'up_to_date' | 'pending' | 'disabled' | 'unavailable';
    currentVersion: string;
    latestVersion: string;
    mandatory: boolean;
    detail: string;
  };
};

export type AdminLocalAgentUpdateResult = {
  ok: boolean;
  result: Record<string, unknown>;
};

export type AdminLocalAgentLogs = {
  ok: boolean;
  available: boolean;
  lines: string[];
  detail?: string;
};

export type AdminLocalAgentBulkAction = 'update' | 'refresh_context' | 'restart';

export type AdminLocalAgentBulkActionResult = {
  ok: boolean;
  action: AdminLocalAgentBulkAction;
  succeeded: number;
  failed: number;
  results: Array<{
    agentId: string;
    restaurantName?: string;
    ok: boolean;
    detail?: string;
    result?: Record<string, unknown>;
  }>;
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

export type AdminLocalAgentsQueryParams = AdminListQueryParams & {
  status?: AdminLocalAgentStatus;
};

export type AdminReportPeriodQueryParams = {
  startDate?: string;
  endDate?: string;
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

export type AdminDistributionPointsQueryParams = AdminListQueryParams & {
  kindIn?: string;
  isActive?: boolean;
};

export type AdminPrepStationsQueryParams = AdminListQueryParams & {
  kindIn?: string;
  isActive?: boolean;
};

export type AdminIntegrationConfigsQueryParams = AdminListQueryParams & {
  kindIn?: string;
  isEnabled?: boolean;
};

export type AdminRestaurantsQueryParams = AdminListQueryParams & {
  isActive?: boolean;
};

export type AdminRestaurantBalanceTransactionsQueryParams = AdminListQueryParams;

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

export type AdminReceiptsReportQueryParams = AdminListQueryParams &
  AdminReportPeriodQueryParams & {
    receiptKind?: 'plain' | 'fiscal';
    status?: AdminReceiptStatus;
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
