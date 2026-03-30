import type {
  AdminKitchenTicket,
  AdminKitchenTicketsQueryParams,
  AdminPaginatedResponse,
  AdminPrepStation,
} from 'shared/api/admin-types';

export interface KitchenRepository {
  getList(params: AdminKitchenTicketsQueryParams): Promise<AdminPaginatedResponse<AdminKitchenTicket>>;
  getById(id: string): Promise<AdminKitchenTicket>;
  getPrepStations(): Promise<AdminPrepStation[]>;
}
