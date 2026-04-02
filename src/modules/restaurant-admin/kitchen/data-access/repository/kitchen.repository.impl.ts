import type { AdminKitchenTicketsQueryParams } from 'shared/api/admin-types';
import { apiClient } from 'shared/api/http/apiClient';

import type { KitchenRepository } from '../../domain';

export const kitchenRepository: KitchenRepository = {
  getList(params: AdminKitchenTicketsQueryParams) {
    return apiClient.getAdminKitchenTickets(params);
  },

  getById(id: string) {
    return apiClient.getAdminKitchenTicketById(id);
  },

  getPrepStations() {
    return apiClient.getAdminPrepStations({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
};
