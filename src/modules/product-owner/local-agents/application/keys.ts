import { createKeyFactory } from 'shared/api';

const localAgentsKeys = createKeyFactory('platform', 'localAgents');

export const localAgentFleetKeys = {
  all: localAgentsKeys.all,
  list: localAgentsKeys.list,
  detail: localAgentsKeys.detail,
  diagnostics: (id: string) => [...localAgentsKeys.detail(id), 'diagnostics'] as const,
  logs: (id: string) => [...localAgentsKeys.detail(id), 'logs'] as const,
} as const;
