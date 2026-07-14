/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useFormContext } from 'react-hook-form';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RestaurantFormPage from './RestaurantFormPage';

const replaceMock = vi.fn();
const pushMock = vi.fn();
const mutateCreateAsyncMock = vi.fn();
const mutateLookupAsyncMock = vi.fn();
const mutateUpdateAsyncMock = vi.fn();
const notifyErrorMock = vi.fn();
const normalizeErrorMock = vi.fn();

let currentParams: { id?: string } = {};
let currentProfile: Record<string, unknown> | null = { restaurantId: null };
let restaurantQueryState: Record<string, unknown> = { data: undefined, isLoading: false, error: null };
let lookupPending = false;

vi.mock('app/layouts/Dashboard', () => ({
  Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('app/routes', () => ({
  RoutePath: {
    main: '/main',
    organizationRestaurantList: '/business-partner/restaurants',
    organizationMyRestaurant: '/business-partner/my-restaurant',
  },
  canAccessRestaurants: () => true,
  canAccessMyRestaurant: () => false,
}));

vi.mock('modules/auth/domain/services/current-user', () => ({
  useCurrentUser: () => ({ profile: currentProfile }),
}));

vi.mock('shared/api/errors/errorHandling', () => ({
  normalizeError: (...args: unknown[]) => normalizeErrorMock(...args),
  notifyError: (...args: unknown[]) => notifyErrorMock(...args),
}));

vi.mock('shared/hooks/router', () => ({
  useParams: () => currentParams,
  useRedirectOnNotFound: vi.fn(),
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
}));

vi.mock('shared/hooks/use-page-title', () => ({
  usePageTitle: vi.fn(),
}));

vi.mock('shared/ui/CustomBreadcrumbs', () => ({
  CustomBreadcrumbs: () => <div data-testid="breadcrumbs" />,
}));

vi.mock('shared/ui/FormActions', () => ({
  FormActions: ({ submitLabel, onCancel }: { submitLabel: string; onCancel: () => void }) => (
    <div>
      <button type="submit">{submitLabel}</button>
      <button type="button" onClick={onCancel}>
        cancel
      </button>
    </div>
  ),
}));

vi.mock('shared/ui/LoadingScreen', () => ({
  LoadingScreen: () => <div data-testid="loading-screen" />,
}));

vi.mock('../../../application', () => ({
  useGetRestaurantByIdQuery: () => restaurantQueryState,
  useCreateRestaurantMutation: () => ({
    mutateAsync: mutateCreateAsyncMock,
  }),
  useLookupRestaurantMutation: () => ({
    mutateAsync: mutateLookupAsyncMock,
    isPending: lookupPending,
  }),
  useUpdateRestaurantMutation: () => ({
    mutateAsync: mutateUpdateAsyncMock,
  }),
}));

vi.mock('./RestaurantFormFields', () => ({
  RestaurantFormFields: ({ isEditMode, onLookup }: { isEditMode: boolean; onLookup: () => void | Promise<void> }) => {
    const {
      watch,
      setValue,
      formState: { errors },
    } = useFormContext();

    return (
      <div>
        <input
          aria-label="name"
          value={(watch('name') as string) ?? ''}
          onChange={(event) => setValue('name', event.target.value, { shouldDirty: true })}
        />
        <input
          aria-label="legalName"
          value={(watch('legalName') as string) ?? ''}
          onChange={(event) => setValue('legalName', event.target.value, { shouldDirty: true })}
        />
        <input
          aria-label="taxNumber"
          value={(watch('taxNumber') as string) ?? ''}
          onChange={(event) => setValue('taxNumber', event.target.value, { shouldDirty: true })}
        />
        <input
          aria-label="phone"
          value={(watch('phone') as string) ?? ''}
          onChange={(event) => setValue('phone', event.target.value, { shouldDirty: true })}
        />
        <input
          aria-label="address"
          value={(watch('address') as string) ?? ''}
          onChange={(event) => setValue('address', event.target.value, { shouldDirty: true })}
        />
        {!isEditMode ? (
          <button type="button" onClick={() => void onLookup()}>
            lookup
          </button>
        ) : null}
        {errors.taxNumber?.message ? <span>{String(errors.taxNumber.message)}</span> : null}
      </div>
    );
  },
}));

describe('RestaurantFormPage', () => {
  beforeEach(() => {
    currentParams = {};
    currentProfile = { restaurantId: null };
    restaurantQueryState = { data: undefined, isLoading: false, error: null };
    lookupPending = false;
    mutateCreateAsyncMock.mockReset();
    mutateLookupAsyncMock.mockReset();
    mutateUpdateAsyncMock.mockReset();
    notifyErrorMock.mockReset();
    normalizeErrorMock.mockReset();
    pushMock.mockReset();
    replaceMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows lookup button only in create mode', () => {
    const { rerender } = render(<RestaurantFormPage />);

    expect(screen.getByRole('button', { name: 'lookup' })).toBeInTheDocument();

    currentParams = { id: 'restaurant-1' };
    restaurantQueryState = {
      data: {
        id: 'restaurant-1',
        name: 'Existing',
        legalName: 'Existing LLC',
        taxNumber: '123',
        phone: '+998900000000',
        address: 'Tashkent',
        serviceFeeEnabled: false,
        serviceFeePercent: 0,
        vatEnabled: false,
        vatPercent: 12,
        markingCheckEnabled: false,
        isActive: true,
        fakturaPayload: { CompanyName: 'Existing' },
      },
      isLoading: false,
      error: null,
    };

    rerender(<RestaurantFormPage />);

    expect(screen.queryByRole('button', { name: 'lookup' })).not.toBeInTheDocument();
  });

  it('hydrates form values from lookup result', async () => {
    mutateLookupAsyncMock.mockResolvedValueOnce({
      taxNumber: '311926992',
      name: 'GULISTON RESTAURANT',
      legalName: 'GULISTON RESTAURANT',
      phone: '+998337700586',
      address: 'Buxoro',
      fakturaPayload: { CompanyName: 'GULISTON RESTAURANT', CompanyInn: '311926992' },
    });

    render(<RestaurantFormPage />);

    fireEvent.change(screen.getByLabelText('taxNumber'), { target: { value: '311926992' } });
    fireEvent.click(screen.getByRole('button', { name: 'lookup' }));

    await waitFor(() => {
      expect(screen.getByLabelText('name')).toHaveValue('GULISTON RESTAURANT');
    });

    expect(screen.getByLabelText('legalName')).toHaveValue('GULISTON RESTAURANT');
    expect(screen.getByLabelText('phone')).toHaveValue('+998337700586');
    expect(screen.getByLabelText('address')).toHaveValue('Buxoro');
  });

  it('binds lookup failures to tax number field and notifies', async () => {
    const normalizedError = { message: 'Lookup failed.' };
    mutateLookupAsyncMock.mockRejectedValueOnce(new Error('boom'));
    normalizeErrorMock.mockReturnValueOnce(normalizedError);

    render(<RestaurantFormPage />);

    fireEvent.change(screen.getByLabelText('taxNumber'), { target: { value: '311926992' } });
    fireEvent.click(screen.getByRole('button', { name: 'lookup' }));

    await waitFor(() => {
      expect(screen.getByText('Lookup failed.')).toBeInTheDocument();
    });

    expect(notifyErrorMock).toHaveBeenCalledWith(normalizedError);
  });

  it('submits faktura payload on create', async () => {
    mutateLookupAsyncMock.mockResolvedValueOnce({
      taxNumber: '311926992',
      name: 'GULISTON RESTAURANT',
      legalName: 'GULISTON RESTAURANT',
      phone: '+998337700586',
      address: 'Buxoro',
      fakturaPayload: { CompanyName: 'GULISTON RESTAURANT', CompanyInn: '311926992' },
    });
    mutateCreateAsyncMock.mockResolvedValueOnce({
      id: 'restaurant-1',
    });

    render(<RestaurantFormPage />);

    fireEvent.change(screen.getByLabelText('taxNumber'), { target: { value: '311926992' } });
    fireEvent.click(screen.getByRole('button', { name: 'lookup' }));

    await waitFor(() => {
      expect(screen.getByLabelText('name')).toHaveValue('GULISTON RESTAURANT');
    });

    fireEvent.submit(screen.getByRole('button', { name: 'actions.create' }).closest('form')!);

    await waitFor(() => {
      expect(mutateCreateAsyncMock).toHaveBeenCalledWith({
        name: 'GULISTON RESTAURANT',
        legalName: 'GULISTON RESTAURANT',
        taxNumber: '311926992',
        phone: '+998337700586',
        social: '',
        address: 'Buxoro',
        fakturaPayload: { CompanyName: 'GULISTON RESTAURANT', CompanyInn: '311926992' },
        serviceFeeEnabled: false,
        serviceFeePercent: 0,
        vatEnabled: false,
        vatPercent: 12,
        markingCheckEnabled: false,
        isActive: false,
      });
    });
  });

  it('loads persisted faktura payload in edit mode and submits without lookup button', async () => {
    currentParams = { id: 'restaurant-1' };
    restaurantQueryState = {
      data: {
        id: 'restaurant-1',
        name: 'BROCCOLI FOOD',
        legalName: 'BROCCOLI FOOD MCHJ',
        taxNumber: '304459113',
        phone: '+998909112881',
        address: 'Toshkent',
        serviceFeeEnabled: true,
        serviceFeePercent: 10,
        vatEnabled: true,
        vatPercent: 12,
        markingCheckEnabled: true,
        isActive: true,
        fakturaPayload: { CompanyName: 'BROCCOLI FOOD', CompanyInn: '304459113' },
      },
      isLoading: false,
      error: null,
    };
    mutateUpdateAsyncMock.mockResolvedValueOnce({ id: 'restaurant-1' });

    render(<RestaurantFormPage />);

    expect(screen.queryByRole('button', { name: 'lookup' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('name')).toHaveValue('BROCCOLI FOOD');

    fireEvent.change(screen.getByLabelText('name'), { target: { value: 'BROCCOLI FOOD Updated' } });
    fireEvent.submit(screen.getByRole('button', { name: 'actions.save' }).closest('form')!);

    await waitFor(() => {
      expect(mutateUpdateAsyncMock).toHaveBeenCalledWith({
        name: 'BROCCOLI FOOD Updated',
        legalName: 'BROCCOLI FOOD MCHJ',
        taxNumber: '304459113',
        phone: '+998909112881',
        social: '',
        address: 'Toshkent',
        fakturaPayload: { CompanyName: 'BROCCOLI FOOD', CompanyInn: '304459113' },
        serviceFeeEnabled: true,
        serviceFeePercent: 10,
        vatEnabled: true,
        vatPercent: 12,
        markingCheckEnabled: true,
        isActive: true,
      });
    });
  });
});
