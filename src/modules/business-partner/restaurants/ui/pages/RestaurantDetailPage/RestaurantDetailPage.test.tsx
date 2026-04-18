/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RestaurantDetailPage from './RestaurantDetailPage';

const replaceMock = vi.fn();
const mutateTopUpAsyncMock = vi.fn();

let currentProfile: Record<string, unknown> | null = {};
let detailQueryState: Record<string, unknown> = { data: undefined, isLoading: false, error: null };
let historyQueryState: Record<string, unknown> = { data: { data: [] }, isLoading: false };

vi.mock('app/layouts/Dashboard', () => ({
  Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({
    t: (key: string, options?: Record<string, unknown>) => String(options?.defaultValue ?? key),
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
  useGetRestaurantBalanceTransactionsQuery: () => historyQueryState,
  useTopUpRestaurantBalanceMutation: () => ({
    mutateAsync: mutateTopUpAsyncMock,
    isPending: false,
  }),
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
    mutateTopUpAsyncMock.mockReset();
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
        billingPeriod: 'monthly',
        expiresOn: '2026-05-01',
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
          mode: 'live',
          provider: 'soliq-ofd',
          terminalId: 'TERM-1',
          cashboxId: 'BOX-1',
          taxNumber: '301234567',
          endpointUrl: 'https://soliq.example/api',
        },
        balance: {
          currentBalance: 5000,
          nextChargeAmount: 1200,
          nextChargeOn: '2026-05-01',
          nextPeriodStatus: 'active',
          lastTopUpAt: '2026-04-18T10:00:00Z',
        },
      },
      isLoading: false,
      error: null,
    };
    historyQueryState = {
      data: {
        data: [
          {
            id: 'tx-1',
            kind: 'top_up',
            amount: 5000,
            balanceAfter: 5000,
            performedBy: { id: 'user-99', fullName: 'Partner Owner', username: 'partner-owner' },
            note: 'Initial top-up',
            createdAt: '2026-04-18T10:00:00Z',
          },
        ],
      },
      isLoading: false,
    };
  });

  it('renders detail sections and submits top-up payload', async () => {
    mutateTopUpAsyncMock.mockResolvedValueOnce(undefined);

    render(<RestaurantDetailPage />);

    expect(screen.getAllByText('Alpha Cafe')).toHaveLength(2);
    expect(screen.getByText("Mijoz ma'lumotlari")).toBeInTheDocument();
    expect(screen.getByText('Aktiv foydalanuvchilar')).toBeInTheDocument();
    expect(screen.getByText('Soliq bilan integratsiya')).toBeInTheDocument();
    expect(screen.getByText('alpha-admin')).toBeInTheDocument();
    expect(screen.getByText('soliq-ofd')).toBeInTheDocument();
    expect(screen.getAllByText('5000 som')).toHaveLength(3);

    fireEvent.click(screen.getByRole('button', { name: "Balansni to'ldirish" }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText("To'ldirish summasi"), { target: { value: '3500' } });
    fireEvent.change(within(dialog).getByLabelText('Izoh'), { target: { value: ' manual top-up ' } });
    fireEvent.click(within(dialog).getByRole('button', { name: "Balansni to'ldirish" }));

    await waitFor(() => {
      expect(mutateTopUpAsyncMock).toHaveBeenCalledWith({
        amount: 3500,
        note: 'manual top-up',
      });
    });
  });
});
