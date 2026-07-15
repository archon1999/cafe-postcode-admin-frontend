/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AdminSessionUser } from 'shared/api/admin-types';

import { AccountDrawer } from './account-drawer';
import { buildAccountDrawerContent, resolveAccountDrawerRole } from './account-drawer.utils';

const useCurrentUserMock = vi.fn();

vi.mock('modules/auth', () => ({
  useCurrentUser: () => useCurrentUserMock(),
}));

vi.mock('minimal-shared/hooks', () => ({
  useBoolean: () => ({
    value: true,
    onFalse: vi.fn(),
    onTrue: vi.fn(),
  }),
}));

vi.mock('app/providers/locales', () => ({
  useTranslate: (namespace: string) => ({
    t: (key: string) => `${namespace}:${key}`,
  }),
}));

vi.mock('./account-button', () => ({
  AccountButton: () => <button type="button" data-testid="account-button" />,
}));

vi.mock('./sign-out-button', () => ({
  SignOutButton: () => <button type="button" data-testid="logout-button" />,
}));

vi.mock('shared/ui/Animate', () => ({
  AnimateBorder: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('shared/ui/Iconify', () => ({
  Iconify: () => <span data-testid="icon" />,
}));

vi.mock('shared/ui/Label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('shared/ui/LabelRowWithIcon/LabelRowWithIcon', () => ({
  LabelRowWithIcon: ({ label, value }: { label: string; value: string }) => (
    <div>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
}));

vi.mock('shared/ui/Scrollbar', () => ({
  Scrollbar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

function createProfile(overrides: Partial<AdminSessionUser> = {}): AdminSessionUser {
  return {
    id: 'user-1',
    username: 'owner01',
    fullName: 'Test User',
    phone: '+998901234567',
    isActive: true,
    role: {
      id: 'role-1',
      code: 'platform_owner',
      name: 'Platform Owner',
      description: '',
      permissions: [],
      isSystem: false,
    },
    permissionCodes: ['users.view', 'roles.view'],
    ...overrides,
  };
}

describe('resolveAccountDrawerRole', () => {
  it('returns superadmin when isSuperuser is true', () => {
    expect(resolveAccountDrawerRole({ isSuperuser: true, businessPartnerId: 'bp-1', restaurantId: 'r-1' })).toBe(
      'superadmin',
    );
  });

  it('returns restaurantAdmin when restaurantId exists', () => {
    expect(resolveAccountDrawerRole({ isSuperuser: false, restaurantId: 'restaurant-1' })).toBe('restaurantAdmin');
  });

  it('returns businessPartner when only businessPartnerId exists', () => {
    expect(resolveAccountDrawerRole({ isSuperuser: false, businessPartnerId: 'bp-1', restaurantId: null })).toBe(
      'businessPartner',
    );
  });

  it('returns productOwner as fallback', () => {
    expect(resolveAccountDrawerRole({ isSuperuser: false, businessPartnerId: null, restaurantId: null })).toBe(
      'productOwner',
    );
  });
});

describe('buildAccountDrawerContent', () => {
  it('adds business partner context row for business partner role', () => {
    const profile = createProfile({
      businessPartnerId: 'bp-42',
      restaurantId: null,
      companyName: 'Acme Group',
      inn: '123456789',
    });
    const content = buildAccountDrawerContent({
      profile,
      user: {
        id: profile.id,
        displayName: profile.fullName,
        photoURL: null,
        role: profile.role?.code ?? null,
        roleLabel: profile.role?.name ?? null,
        username: profile.username,
        phone: profile.phone,
      },
      tCommon: ((key: string) => key) as never,
    });

    expect(content.resolvedRole).toBe('businessPartner');
    expect(
      content.rows.some((row) => row.label === 'accountDrawer.labels.companyName' && row.value === 'Acme Group'),
    ).toBe(true);
    expect(content.rows.some((row) => row.label === 'accountDrawer.labels.inn' && row.value === '123456789')).toBe(
      true,
    );
  });
});

describe('AccountDrawer', () => {
  it('renders business partner specific rows', () => {
    const profile = createProfile({
      businessPartnerId: 'bp-007',
      restaurantId: null,
      companyName: 'Partner Company',
      inn: '123456789',
    });
    useCurrentUserMock.mockReturnValue({
      profile,
      user: {
        id: profile.id,
        displayName: profile.fullName,
        photoURL: null,
        role: profile.role?.code ?? null,
        roleLabel: profile.role?.name ?? null,
        username: profile.username,
        phone: profile.phone,
        isActive: profile.isActive,
      },
    });

    render(<AccountDrawer />);

    expect(screen.getByText('common:accountDrawer.roles.businessPartner')).toBeInTheDocument();
    expect(screen.getByText('common:accountDrawer.labels.companyName')).toBeInTheDocument();
    expect(screen.getByText('Partner Company')).toBeInTheDocument();
    expect(screen.getByText('common:accountDrawer.labels.inn')).toBeInTheDocument();
    expect(screen.getByText('123456789')).toBeInTheDocument();
    expect(screen.queryByText('users:fields.permissions')).not.toBeInTheDocument();
    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  it('renders restaurant admin specific rows', () => {
    const profile = createProfile({
      businessPartnerId: 'bp-007',
      restaurantId: 'restaurant-11',
      restaurantName: 'Test Restaurant',
      tariff: {
        id: 'tariff-1',
        name: 'Premium',
        permissionCodes: [],
        roleCodes: [],
      },
      activatedAt: '2026-01-01',
      expiresOn: '2026-12-31',
    });
    useCurrentUserMock.mockReturnValue({
      profile,
      user: {
        id: profile.id,
        displayName: profile.fullName,
        photoURL: null,
        role: profile.role?.code ?? null,
        roleLabel: profile.role?.name ?? null,
        username: profile.username,
        phone: profile.phone,
        isActive: profile.isActive,
      },
    });

    render(<AccountDrawer />);

    expect(screen.getByText('common:accountDrawer.roles.restaurantAdmin')).toBeInTheDocument();
    expect(screen.getByText('common:accountDrawer.labels.restaurantName')).toBeInTheDocument();
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText('common:accountDrawer.labels.tariff')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.queryByText('users:fields.permissions')).not.toBeInTheDocument();
  });

  it('renders product owner business partner count instead of permissions', () => {
    const profile = createProfile({
      businessPartnerId: null,
      restaurantId: null,
      isSuperuser: false,
      businessPartnersCount: 17,
    });
    useCurrentUserMock.mockReturnValue({
      profile,
      user: {
        id: profile.id,
        displayName: profile.fullName,
        photoURL: null,
        role: profile.role?.code ?? null,
        roleLabel: profile.role?.name ?? null,
        username: profile.username,
        phone: profile.phone,
        isActive: profile.isActive,
      },
    });

    render(<AccountDrawer />);

    expect(screen.getByText('common:accountDrawer.roles.productOwner')).toBeInTheDocument();
    expect(screen.getByText('common:accountDrawer.labels.businessPartnersCount')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
    expect(screen.queryByText('users:fields.permissions')).not.toBeInTheDocument();
  });

  it('does not render role and permissions rows for superadmin', () => {
    const profile = createProfile({ isSuperuser: true, businessPartnerId: null, restaurantId: null });
    useCurrentUserMock.mockReturnValue({
      profile,
      user: {
        id: profile.id,
        displayName: profile.fullName,
        photoURL: null,
        role: profile.role?.code ?? null,
        roleLabel: profile.role?.name ?? null,
        username: profile.username,
        phone: profile.phone,
        isActive: profile.isActive,
      },
    });

    render(<AccountDrawer />);

    expect(screen.getByText('common:accountDrawer.roles.superadmin')).toBeInTheDocument();
    expect(screen.queryByText('users:fields.role')).not.toBeInTheDocument();
    expect(screen.queryByText('users:fields.permissions')).not.toBeInTheDocument();
  });
});
