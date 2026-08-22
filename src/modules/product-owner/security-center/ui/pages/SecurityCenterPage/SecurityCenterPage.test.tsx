// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import type { PropsWithChildren, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SecurityCenterPage from './SecurityCenterPage';

vi.mock('app/config/globalConfig', () => ({ CONFIG: { controlAppUrl: 'https://control.cafe-postcode.uz/' } }));

vi.mock('app/layouts/Dashboard', () => ({
  ListPageContent: ({ children }: PropsWithChildren) => <main>{children}</main>,
  ListPageBody: ({ children }: PropsWithChildren) => <section>{children}</section>,
}));

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({ t: (key: string) => key }),
}));

vi.mock('app/routes', () => ({
  RoutePath: { main: '/', platformLocalAgentList: '/product-owner/local-agents' },
}));

vi.mock('modules/auth/domain/services/current-user', () => ({
  useCurrentUser: () => ({ profile: { isSuperuser: true } }),
}));

vi.mock('shared/hooks/router', () => ({ useRouter: () => ({ replace: vi.fn() }) }));

vi.mock('shared/ui/CustomBreadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading, action }: { heading: ReactNode; action: ReactNode }) => (
    <header>
      <h1>{heading}</h1>
      {action}
    </header>
  ),
}));

vi.mock('shared/ui/Iconify', () => ({ Iconify: () => null }));

vi.mock('./components', () => ({
  MonitoringPanel: ({ onSecurityDateSelect }: { onSecurityDateSelect?: (date: string) => void }) => (
    <button type="button" onClick={() => onSecurityDateSelect?.('2026-08-20')}>
      monitoring-panel
    </button>
  ),
  SecurityEventsPanel: ({ dateRange }: { dateRange?: { startDate: string; endDate: string } | null }) => (
    <div>
      security-panel {dateRange?.startDate} {dateRange?.endDate}
    </div>
  ),
  TelegramPanel: () => <div>telegram-panel</div>,
}));

afterEach(cleanup);

describe('SecurityCenterPage scope', () => {
  it('keeps monitoring, security and notifications in Admin and sends device operations to Control PWA', () => {
    render(<SecurityCenterPage />);

    const tabs = screen.getByRole('tablist', { name: 'controlCenter.details.tabsLabel' });
    expect(within(tabs).getAllByRole('tab')).toHaveLength(3);
    expect(within(tabs).getByRole('tab', { name: 'tabs.monitoring' })).toBeVisible();
    expect(within(tabs).getByRole('tab', { name: 'tabs.events' })).toBeVisible();
    expect(within(tabs).getByRole('tab', { name: 'tabs.notifications' })).toBeVisible();
    expect(within(tabs).queryByRole('tab', { name: 'tabs.migration' })).not.toBeInTheDocument();
    expect(within(tabs).queryByRole('tab', { name: 'tabs.devices' })).not.toBeInTheDocument();
    expect(within(tabs).queryByRole('tab', { name: 'tabs.pairings' })).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'controlCenter.openControl' })).toHaveAttribute(
      'href',
      'https://control.cafe-postcode.uz/',
    );
    expect(screen.getByText('monitoring-panel')).toBeVisible();
  });

  it('opens the security events tab and applies the selected chart day', () => {
    render(<SecurityCenterPage />);

    fireEvent.click(screen.getByRole('button', { name: 'monitoring-panel' }));

    expect(screen.getByRole('tab', { name: 'tabs.events' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('security-panel 2026-08-20 2026-08-20')).toBeVisible();
  });
});
