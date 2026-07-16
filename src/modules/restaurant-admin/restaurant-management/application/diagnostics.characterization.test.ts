// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useQueryMock, repositoryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn((options) => options),
  repositoryMock: {
    getLocalAgentStatus: vi.fn(),
    getLocalAgentDiagnostics: vi.fn(),
    getLocalAgentLogs: vi.fn(),
  },
}));

vi.mock('@tanstack/react-query', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@tanstack/react-query')>()),
  useQuery: useQueryMock,
}));
vi.mock('../data-access', () => ({ organizationsRepository: {} }));
vi.mock('shared/api/http/apiClient', () => ({ apiClient: {} }));
vi.mock('../data-access/repository/setup.repository', () => ({
  restaurantSetupRepository: repositoryMock,
}));

import { useLocalAgentDiagnosticsQuery, useLocalAgentLogsQuery, useLocalAgentStatusQuery } from './queries';

type QueryOptions = {
  queryFn: () => Promise<unknown>;
  enabled?: boolean;
  retry?: boolean;
  refetchInterval?: number;
};

describe('Admin diagnostics query lifecycle', () => {
  beforeEach(() => {
    useQueryMock.mockClear();
    Object.values(repositoryMock).forEach((mock) => mock.mockReset());
  });

  it('polls lightweight Agent status every 30 seconds', async () => {
    repositoryMock.getLocalAgentStatus.mockResolvedValue({ agent: null, update: null });
    const options = useLocalAgentStatusQuery() as unknown as QueryOptions;
    expect(options.refetchInterval).toBe(30_000);
    await options.queryFn();
    expect(repositoryMock.getLocalAgentStatus).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['diagnostics', useLocalAgentDiagnosticsQuery, repositoryMock.getLocalAgentDiagnostics],
    ['logs', useLocalAgentLogsQuery, repositoryMock.getLocalAgentLogs],
  ] as const)('loads %s only while the dialog requests it', async (_name, hook, repositoryMethod) => {
    repositoryMethod.mockResolvedValue({});
    const disabled = hook(false) as unknown as QueryOptions;
    expect(disabled.enabled).toBe(false);
    expect(disabled.retry).toBe(false);

    const enabled = hook(true) as unknown as QueryOptions;
    expect(enabled.enabled).toBe(true);
    await enabled.queryFn();
    expect(repositoryMethod).toHaveBeenCalledTimes(1);
  });
});
