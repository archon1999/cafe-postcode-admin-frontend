/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RestaurantDetailPage from './RestaurantDetailPage';

const replaceMock = vi.fn();

let currentProfile: Record<string, unknown> | null = {};
let detailQueryState: Record<string, unknown> = { data: undefined, isLoading: false, error: null };

vi.mock('app/layouts/Dashboard', () => ({
  Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({
    t: (key: string) =>
      (
        ({
          'sections.customerOverview.title': "Mijoz ma'lumotlari",
          'sections.activeUsers.title': 'Aktiv foydalanuvchilar',
          'sections.soliqIntegration.title': 'Soliq bilan integratsiya',
        }) as Record<string, string>
      )[key] ?? key,
  }),
}));

vi.mock('app/routes', () => ({
  RoutePath: {
    main: '/main',
    organizationRestaurantList: '/business-partner/restaurants',
  },
  RouterPathHelper: {
    organizationRestaurantEdit: (id: string) => `/business-partner/restaurants/${id}/edit`,
  },
  canAccessRestaurants: () => true,
}));

vi.mock('modules/auth/domain/services/current-user', () => ({
  useCurrentUser: () => ({ profile: currentProfile }),
}));

vi.mock('modules/business-partner/restaurants/application', () => ({
  useGetRestaurantDetailQuery: () => detailQueryState,
}));

vi.mock('shared/hooks/router', () => ({
  useParams: () => ({ id: 'restaurant-1' }),
  useRedirectOnNotFound: vi.fn(),
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock('shared/ui/CustomBreadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: { heading: string }) => <div>{heading}</div>,
}));

vi.mock('shared/ui/LoadingScreen', () => ({
  LoadingScreen: () => <div data-testid="loading-screen" />,
}));

vi.mock('shared/utils/format-money', () => ({
  formatMoney: (value: unknown) => `${value} som`,
  formatMoneyNumber: (value: unknown) => String(value ?? ''),
  getMoneySuffix: () => "so'm",
  parseMoneyInput: (value: string) => {
    const normalizedValue = value.replace(/[^\d]/g, '');

    return normalizedValue ? Number(normalizedValue) : '';
  },
}));

vi.mock('shared/utils/format-time', () => ({
  formatDate: (value: string) => value,
  formatDateTime: (value: string) => value,
}));

afterEach(() => {
  cleanup();
});

describe('RestaurantDetailPage', () => {
  beforeEach(() => {
    currentProfile = {};
    replaceMock.mockReset();
    detailQueryState = {
      data: {
        id: 'restaurant-1',
        name: 'Alpha Cafe',
        legalName: 'Alpha Cafe LLC',
        taxNumber: '301234567',
        phone: '+998901234567',
        address: 'Tashkent',
        isActive: true,
        activationType: 'custom',
        tariff: null,
        activeUsers: [
          {
            id: 'user-1',
            fullName: 'Restaurant Admin',
            username: 'alpha-admin',
            role: { id: 'role-1', code: 'restaurant_admin', name: 'Restaurant admin' },
          },
        ],
        soliqIntegration: {
          configured: true,
          isEnabled: true,
          provider: 'fiscal-drive-service',
          terminalId: 'TERM-1',
          cashboxId: 'BOX-1',
          taxNumber: '301234567',
          endpointUrl: 'https://soliq.example/api',
        },
      },
      isLoading: false,
      error: null,
    };
  });

  it('renders restaurant detail sections without subscription billing data', () => {
    render(<RestaurantDetailPage />);

    expect(screen.getAllByText('Alpha Cafe')).toHaveLength(2);
    expect(screen.getByText("Mijoz ma'lumotlari")).toBeInTheDocument();
    expect(screen.getByText('Aktiv foydalanuvchilar')).toBeInTheDocument();
    expect(screen.getByText('Soliq bilan integratsiya')).toBeInTheDocument();
    expect(screen.getByText('alpha-admin')).toBeInTheDocument();
    expect(screen.getByText('fiscal-drive-service')).toBeInTheDocument();
  });
});
