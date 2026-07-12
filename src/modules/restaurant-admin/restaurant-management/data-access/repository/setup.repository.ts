import { instance } from 'shared/api/http/axiosInstance';

import type {
  LocalAgentEnrollment,
  RestaurantSetupApplyPayload,
  RestaurantSetupApplyResponse,
  RestaurantSetupReadiness,
} from '../../domain';

export const restaurantSetupRepository = {
  getReadiness() {
    return instance
      .get<RestaurantSetupReadiness>('/api/v1/admin/restaurants/setup/readiness/')
      .then((response) => response.data);
  },
  apply(payload: RestaurantSetupApplyPayload) {
    return instance
      .post<RestaurantSetupApplyResponse>('/api/v1/admin/restaurants/setup/apply/', payload)
      .then((response) => response.data);
  },
  issueLocalAgentEnrollment() {
    return instance
      .post<LocalAgentEnrollment>('/api/v1/local-agent/enrollment-token/')
      .then((response) => response.data);
  },
};
