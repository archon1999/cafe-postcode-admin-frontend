// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, within } from '@testing-library/react';
import type { PropsWithChildren, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SecurityCenterPage from './SecurityCenterPage';

vi.mock('app/config/globalConfig', () => ({ CONFIG: { controlAppUrl: '/control/' } }));

vi.mock('app/layouts/Dashboard', () => ({
  ListPageContent: ({ children }: PropsWithChildren) => <main>{children}</main>,
  ListPageBody: ({ children }: PropsWithChildren) => <section>{children}</section>,
}));

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({ t: (key: string) => key }),
}));

vi.mock('app/routes', () => ({ RoutePath: { main: '/' } }));

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

vi.mock('./components/MigrationPanel', () => ({ MigrationPanel: () => <div>migration-panel</div> }));
vi.mock('./components/SecurityEventsPanel', () => ({ SecurityEventsPanel: () => <div>security-panel</div> }));
vi.mock('./components/TelegramPanel', () => ({ TelegramPanel: () => <div>telegram-panel</div> }));

afterEach(cleanup);

describe('SecurityCenterPage scope', () => {
  it('keeps migration, security and Telegram in Admin and sends device operations to Control PWA', () => {
    render(<SecurityCenterPage />);

    const tabs = screen.getByRole('tablist', { name: 'controlCenter.tabsLabel' });
    expect(within(tabs).getAllByRole('tab')).toHaveLength(3);
    expect(within(tabs).getByRole('tab', { name: 'tabs.migration' })).toBeVisible();
    expect(within(tabs).getByRole('tab', { name: 'tabs.events' })).toBeVisible();
    expect(within(tabs).getByRole('tab', { name: 'tabs.telegram' })).toBeVisible();
    expect(within(tabs).queryByRole('tab', { name: 'tabs.devices' })).not.toBeInTheDocument();
    expect(within(tabs).queryByRole('tab', { name: 'tabs.pairings' })).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'controlCenter.openControl' })).toHaveAttribute('href', '/control/');
    expect(screen.getByText('migration-panel')).toBeVisible();
  });
});
