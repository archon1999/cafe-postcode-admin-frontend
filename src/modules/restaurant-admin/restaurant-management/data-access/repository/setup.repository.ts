import { instance } from 'shared/api/http/axiosInstance';

import type {
  LocalAgentAdminStatus,
  LocalAgentDiagnostics,
  LocalAgentLogs,
  RestaurantSetupApplyPayload,
  RestaurantSetupApplyResponse,
  RestaurantSetupReadiness,
} from '../../domain';

type LocalAgentStatusResponse = {
  agent: {
    id: string;
    name: string;
    online: boolean;
    last_seen_at: string | null;
    version: string;
    capabilities: string[];
  } | null;
  update: LocalAgentAdminStatus['update'];
};

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
  getLocalAgentStatus() {
    return instance
      .get<LocalAgentStatusResponse>('/api/v1/local-agent/status/')
      .then<LocalAgentAdminStatus>((response) => ({
        agent: response.data.agent
          ? {
              id: response.data.agent.id,
              name: response.data.agent.name,
              online: response.data.agent.online,
              lastSeenAt: response.data.agent.last_seen_at,
              version: response.data.agent.version,
              capabilities: response.data.agent.capabilities,
            }
          : null,
        update: response.data.update,
      }));
  },
  getLocalAgentDiagnostics() {
    return instance
      .get<{ ok: boolean; status: LocalAgentDiagnostics }>('/api/v1/local-agent/diagnostics/')
      .then((response) => response.data.status);
  },
  getLocalAgentLogs() {
    return instance.get<LocalAgentLogs>('/api/v1/local-agent/logs/').then((response) => response.data);
  },
  requestLocalAgentUpdate() {
    return instance
      .post<{ ok: boolean; result: { accepted: boolean; currentVersion: string } }>('/api/v1/local-agent/update-now/')
      .then((response) => response.data.result);
  },
};
