export type ZReportQueryParams = {
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  ordering?: string;
  cashDeskId?: string;
};

export type ZReportRow = {
  id: string;
  cashDeskName: string;
  cashierName: string;
  terminalId: string;
  openedAt: string;
  closedAt: string;
  cashTotal: number | null;
  cardTotal: number | null;
  qrTotal: number | null;
  saleTotal: number | null;
  refundTotal: number | null;
  saleCount: number | null;
  refundCount: number | null;
};
