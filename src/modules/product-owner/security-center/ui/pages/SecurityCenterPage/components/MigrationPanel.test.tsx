// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DeviceMigrationSummary } from '../../../../domain';

import { MigrationPanel } from './MigrationPanel';

const mocks = vi.hoisted(() => ({ query: vi.fn(), refetch: vi.fn() }));

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({ t: (key: string) => key }),
}));

vi.mock('shared/utils/format-time', () => ({ formatDateTime: (value: string) => value }));

vi.mock('../../../../application', () => ({
  useDeviceMigrationSummaryQuery: mocks.query,
}));

function summary(): DeviceMigrationSummary {
  return {
    restaurants: { total: 11, withActiveAgentDevice: 0, withoutActiveAgentDevice: 11 },
    devices: { active: 0, revoked: 0, byType: {} },
    pairings: { pending: 0 },
    legacy: {
      localAgentsTotal: 0,
      localAgentsMigrated: 0,
      posSessionsUnbound: 0,
      tvMonitorsTotal: 0,
      tvMonitorsMigrated: 0,
    },
    branches: Array.from({ length: 11 }, (_value, index) => ({
      restaurantId: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
      restaurantName: `Branch ${String(index + 1).padStart(2, '0')}`,
      activePOSDevices: 0,
      unboundPOSSessions: 0,
      agent: null,
    })),
  };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('MigrationPanel', () => {
  it('renders a compact ten-row migration table instead of an unbounded dashboard', () => {
    mocks.query.mockReturnValue({
      data: summary(),
      dataUpdatedAt: Date.parse('2026-08-17T00:00:00Z'),
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: mocks.refetch,
    });

    render(<MigrationPanel />);

    expect(screen.getAllByRole('button', { name: 'migration.details' })).toHaveLength(10);
    expect(screen.getByText('Branch 01')).toBeVisible();
    expect(screen.queryByText('Branch 11')).not.toBeInTheDocument();
    expect(screen.queryByText('00000000-0000-4000-8000-000000000001')).not.toBeInTheDocument();
  });

  it('shows fail-closed gate reasons only when details are requested', () => {
    mocks.query.mockReturnValue({
      data: summary(),
      dataUpdatedAt: Date.parse('2026-08-17T00:00:00Z'),
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: mocks.refetch,
    });

    render(<MigrationPanel />);
    fireEvent.click(screen.getAllByRole('button', { name: 'migration.details' })[0]);

    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getAllByText('readiness.reasons.agentMissing')).toHaveLength(2);
    expect(screen.getByText('readiness.reasons.activePOSDevicesMissing')).toBeVisible();
  });
});
