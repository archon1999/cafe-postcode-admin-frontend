import { createKeyFactory } from 'shared/api';

const localAgentsKeys = createKeyFactory('platform', 'localAgents');

export const localAgentFleetKeys = {
  all: localAgentsKeys.all,
  list: localAgentsKeys.list,
  detail: localAgentsKeys.detail,
  diagnostics: (id: string) => [...localAgentsKeys.detail(id), 'diagnostics'] as const,
  logs: (id: string) => [...localAgentsKeys.detail(id), 'logs'] as const,
  supportCatalog: [...localAgentsKeys.all, 'supportCatalog'] as const,
  supportHistory: (id: string) => [...localAgentsKeys.detail(id), 'supportHistory'] as const,
  supportStatus: (id: string, requestId: string) =>
    [...localAgentsKeys.detail(id), 'supportStatus', requestId] as const,
} as const;
