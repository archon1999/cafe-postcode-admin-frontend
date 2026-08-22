// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MonitoringPanel, type MonitoringPanelProps } from './MonitoringPanel';

const mocks = vi.hoisted(() => ({ query: vi.fn(), refetch: vi.fn() }));

vi.mock('@mui/material/useMediaQuery', () => ({ default: () => false }));
vi.mock('app/routes', () => ({
  RouterPathHelper: {
    organizationRestaurantDetail: (id: string) => `/business-partner/restaurants/${id}`,
  },
}));
vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({
    t: (key: string, options?: { count?: number }) => (options?.count === undefined ? key : `${key}:${options.count}`),
  }),
}));
vi.mock('shared/ui/Iconify', () => ({ Iconify: () => null }));
vi.mock('shared/ui/Label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));
vi.mock('shared/ui/Scrollbar', () => ({
  Scrollbar: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('shared/ui/Chart', () => ({
  Chart: ({
    series,
    options,
  }: {
    series: Array<{ name: string; data: number[] }>;
    options?: {
      chart?: {
        events?: {
          dataPointSelection?: (event: unknown, chartContext: unknown, config: { dataPointIndex: number }) => void;
        };
      };
    };
  }) => (
    <div data-testid="security-activity-chart">
      {series.map((item) => (
        <span key={item.name}>{`${item.name}:${item.data.join(',')}`}</span>
      ))}
      <button type="button" onClick={() => options?.chart?.events?.dataPointSelection?.({}, {}, { dataPointIndex: 1 })}>
        select-security-date
      </button>
    </div>
  ),
  useChart: (options: unknown) => options,
}));
vi.mock('../../../../application', () => ({ useMonitoringOverviewQuery: () => mocks.query() }));
vi.mock('../../../../domain', () => ({
  assessBranchHealth: (branch: { restaurantName: string }) => {
    if (branch.restaurantName === 'Bravo Critical') return { status: 'critical', reasons: ['agent_offline'] };
    if (branch.restaurantName === 'Charlie Attention') return { status: 'attention', reasons: ['high_security_event'] };
    return { status: 'healthy', reasons: [] };
  },
}));

const theme = createTheme({ cssVariables: true });
const branches = [
  {
    restaurantId: 'alpha',
    restaurantName: 'Alpha Healthy',
    agent: {
      id: 'agent-alpha',
      version: '1.1.0',
      lastSeenAt: '2026-08-22T08:00:00Z',
      online: true,
      protocolVersion: 2,
      deviceStatus: 'ACTIVE' as const,
    },
    devices: {
      active: 3,
      online: 3,
      revoked: 0,
      activeLocalAgent: 1,
      activePOS: 1,
      activeTV: 1,
      activeControl: 1,
      telegramSubscriptions: 2,
      lastSeenAt: '2026-08-22T08:00:00Z',
    },
    security: { unacknowledgedHigh: 0, unacknowledgedCritical: 0, lastEventAt: null },
  },
  {
    restaurantId: 'bravo',
    restaurantName: 'Bravo Critical',
    agent: {
      id: 'agent-bravo',
      version: '1.0.9',
      lastSeenAt: '2026-08-21T08:00:00Z',
      online: false,
      protocolVersion: 2,
      deviceStatus: 'ACTIVE' as const,
    },
    devices: {
      active: 1,
      online: 0,
      revoked: 1,
      activeLocalAgent: 1,
      activePOS: 1,
      activeTV: 0,
      activeControl: 0,
      telegramSubscriptions: 0,
      lastSeenAt: '2026-08-21T08:00:00Z',
    },
    security: { unacknowledgedHigh: 0, unacknowledgedCritical: 1, lastEventAt: '2026-08-22T07:00:00Z' },
  },
  {
    restaurantId: 'charlie',
    restaurantName: 'Charlie Attention',
    agent: {
      id: 'agent-charlie',
      version: '1.1.0',
      lastSeenAt: '2026-08-22T08:00:00Z',
      online: true,
      protocolVersion: 2,
      deviceStatus: 'ACTIVE' as const,
    },
    devices: {
      active: 2,
      online: 1,
      revoked: 0,
      activeLocalAgent: 1,
      activePOS: 1,
      activeTV: 1,
      activeControl: 0,
      telegramSubscriptions: 1,
      lastSeenAt: '2026-08-22T08:00:00Z',
    },
    security: { unacknowledgedHigh: 1, unacknowledgedCritical: 0, lastEventAt: '2026-08-22T06:00:00Z' },
  },
];

function renderPanel(props?: MonitoringPanelProps) {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={theme}>
        <MonitoringPanel {...props} />
      </ThemeProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mocks.refetch.mockReset();
  mocks.query.mockReturnValue({
    data: {
      generatedAt: new Date().toISOString(),
      summary: {
        totalBranches: 3,
        agentOnline: 2,
        agentOffline: 1,
        agentMissing: 0,
        activeDevices: 6,
        revokedDevices: 1,
        activePOSTerminals: 3,
        pendingPairings: 2,
        unacknowledgedHigh: 1,
        unacknowledgedCritical: 1,
      },
      insights: {
        securityActivity: [
          { date: '2026-08-16', high: 0, critical: 0 },
          { date: '2026-08-17', high: 1, critical: 0 },
          { date: '2026-08-18', high: 0, critical: 1 },
          { date: '2026-08-19', high: 2, critical: 0 },
          { date: '2026-08-20', high: 0, critical: 0 },
          { date: '2026-08-21', high: 1, critical: 1 },
          { date: '2026-08-22', high: 1, critical: 0 },
        ],
        agentVersions: [
          { version: '1.0.9', total: 1, online: 0, offline: 1 },
          { version: '1.1.0', total: 2, online: 2, offline: 0 },
        ],
        deviceTypes: { localAgent: 3, pos: 3, tv: 2, control: 1 },
      },
      branches,
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: mocks.refetch,
  });
});

afterEach(cleanup);

describe('MonitoringPanel', () => {
  it('renders real monitoring insights and prioritizes risk status tabs', () => {
    renderPanel();

    expect(screen.getAllByText('monitoring.metrics.totalBranches').length).toBeGreaterThan(0);
    expect(screen.getByText('monitoring.metrics.onlineAgents')).toBeVisible();
    expect(screen.getByText('monitoring.metrics.risks')).toBeVisible();
    expect(screen.getByRole('img', { name: 'monitoring.securityActivity.chartLabel' })).toBeVisible();
    expect(screen.getByTestId('security-activity-chart')).toHaveTextContent('monitoring.security.high:0,1,0,2,0,1,1');
    expect(screen.getByTestId('security-activity-chart')).toHaveTextContent(
      'monitoring.security.critical:0,0,1,0,0,1,0',
    );
    expect(screen.getAllByText('1.0.9').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1.1.0').length).toBeGreaterThan(0);
    expect(screen.getByText('monitoring.agentVersions.missing')).toBeVisible();
    expect(screen.getByText('3/3')).toBeVisible();
    expect(screen.queryByText('monitoring.devices.onlineCount')).not.toBeInTheDocument();
    expect(screen.queryByText('monitoring.devices.none')).not.toBeInTheDocument();

    const alphaRow = screen.getByRole('row', { name: /Alpha Healthy/i });
    expect(within(alphaRow).getByLabelText('monitoring.devices.localAgent: 1')).toBeVisible();
    expect(within(alphaRow).getByLabelText('monitoring.devices.pos: 1')).toBeVisible();
    expect(within(alphaRow).getByLabelText('monitoring.devices.tv: 1')).toBeVisible();
    expect(within(alphaRow).getByLabelText('monitoring.devices.telegram: 2')).toBeVisible();

    const bravoRow = screen.getByRole('row', { name: /Bravo Critical/i });
    expect(within(bravoRow).queryByLabelText(/monitoring\.devices\.tv:/i)).not.toBeInTheDocument();
    expect(within(bravoRow).queryByLabelText(/monitoring\.devices\.telegram:/i)).not.toBeInTheDocument();

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'monitoring.filters.all3',
      'monitoring.health.critical1',
      'monitoring.health.attention1',
      'monitoring.health.healthy1',
    ]);

    fireEvent.click(screen.getByRole('tab', { name: /monitoring.health.critical/i }));

    expect(screen.getByRole('tab', { name: /monitoring.health.critical/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByText('Alpha Healthy')).not.toBeInTheDocument();
    expect(screen.getAllByText('Bravo Critical').length).toBeGreaterThan(0);
  });

  it('filters the registry from agent versions and exposes a clearable active filter', () => {
    renderPanel();

    const versionFilter = screen.getByRole('button', { name: /1\.0\.9/i });
    fireEvent.click(versionFilter);

    expect(versionFilter).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('monitoring.filters.agentVersion: 1.0.9')).toBeVisible();
    expect(screen.getByRole('row', { name: /Bravo Critical/i })).toBeVisible();
    expect(screen.queryByRole('row', { name: /Alpha Healthy/i })).not.toBeInTheDocument();

    const filterChip = screen.getByText('monitoring.filters.agentVersion: 1.0.9').closest('.MuiChip-root');
    const clearButton = filterChip?.querySelector('.MuiChip-deleteIcon');
    expect(clearButton).not.toBeNull();
    fireEvent.click(clearButton!);

    expect(screen.getByRole('row', { name: /Alpha Healthy/i })).toBeVisible();
  });

  it('filters the registry by clicking an operational health row', () => {
    renderPanel();

    const criticalFilter = screen.getByRole('button', { name: /monitoring\.health\.critical.*1 \/ 3/i });
    fireEvent.click(criticalFilter);

    expect(criticalFilter).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('tab', { name: /monitoring.health.critical/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('row', { name: /Bravo Critical/i })).toBeVisible();
    expect(screen.queryByRole('row', { name: /Alpha Healthy/i })).not.toBeInTheDocument();
  });

  it('searches, clears search and links details to the restaurant detail page', () => {
    renderPanel();

    fireEvent.change(screen.getByPlaceholderText('monitoring.filters.searchPlaceholder'), {
      target: { value: 'Alpha' },
    });
    expect(screen.getByText('Alpha Healthy')).toBeVisible();
    expect(screen.queryByText('Bravo Critical')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'monitoring.filters.clearSearch' }));
    expect(screen.getByText('Bravo Critical')).toBeVisible();

    expect(screen.getByRole('link', { name: 'monitoring.actions.details: Alpha Healthy' })).toHaveAttribute(
      'href',
      '/business-partner/restaurants/alpha',
    );
  });

  it('reports the exact clicked security activity date', () => {
    const onSecurityDateSelect = vi.fn();
    renderPanel({ onSecurityDateSelect });

    fireEvent.click(screen.getByRole('button', { name: 'select-security-date' }));

    expect(onSecurityDateSelect).toHaveBeenCalledWith('2026-08-17');
  });

  it('refreshes from the registry toolbar', () => {
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'monitoring.refresh' }));

    expect(mocks.refetch).toHaveBeenCalledOnce();
  });

  it('shows a retry state when monitoring data cannot be loaded', () => {
    mocks.query.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      refetch: mocks.refetch,
    });
    renderPanel();

    expect(screen.getByText('monitoring.loadError')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'monitoring.retry' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
});
