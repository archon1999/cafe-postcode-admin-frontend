import { afterEach, describe, expect, it, vi } from 'vitest';

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));
const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
}));
const { putMock } = vi.hoisted(() => ({
  putMock: vi.fn(),
}));
const { deleteMock } = vi.hoisted(() => ({
  deleteMock: vi.fn(),
}));

vi.mock('./axiosInstance.ts', () => ({
  instance: {
    get: getMock,
    post: postMock,
    put: putMock,
    delete: deleteMock,
  },
}));

import { apiClient } from './apiClient';

afterEach(() => {
  getMock.mockReset();
  postMock.mockReset();
  putMock.mockReset();
  deleteMock.mockReset();
});

describe('apiClient query params', () => {
  it('sends list filters in camelCase for admin users', async () => {
    getMock.mockResolvedValueOnce({ data: { data: [], count: 0, total: 0, page: 1, pageSize: 20, pagesCount: 0 } });

    await apiClient.getAdminUsers({
      page: 2,
      pageSize: 20,
      search: 'ali',
      roleIdIn: 'manager-role-id',
      employmentStatusIn: 'active',
      ordering: '-createdAt',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/users/', {
      params: {
        page: 2,
        pageSize: 20,
        search: 'ali',
        role_id_in: 'manager-role-id',
        employment_status_in: 'active',
        ordering: '-createdAt',
      },
    });
  });

  it('sends report filters in camelCase for sales reports', async () => {
    getMock.mockResolvedValueOnce({ data: { data: [], count: 0, total: 0, page: 1, pageSize: 10, pagesCount: 0 } });

    await apiClient.getAdminSalesReport({
      page: 1,
      pageSize: 10,
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      paymentMethod: 'card',
      ordering: '-total',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/reporting/sales/', {
      params: {
        page: 1,
        pageSize: 10,
        startDate: '2026-03-01',
        endDate: '2026-03-31',
        paymentMethod: 'card',
        ordering: '-total',
        search: undefined,
        status: undefined,
        hallId: undefined,
        categoryId: undefined,
        cashDeskId: undefined,
        cashierId: undefined,
        differenceOnly: undefined,
      },
    });
  });

  it('creates restaurants without a timezone field', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        id: 'restaurant-1',
        name: 'Cafe',
        legalName: '',
        taxNumber: '',
        phone: '',
        social: '',
        address: '',
        currency: 'UZS',
        isActive: true,
      },
    });

    await apiClient.createAdminRestaurant({
      name: 'Cafe',
      legalName: '',
      taxNumber: '',
      phone: '',
      social: '',
      address: '',
      serviceFeeEnabled: false,
      serviceFeePercent: 0,
      vatEnabled: false,
      vatPercent: 12,
      isActive: true,
    });

    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/', {
      name: 'Cafe',
      legalName: '',
      taxNumber: '',
      phone: '',
      social: '',
      address: '',
      serviceFeeEnabled: false,
      serviceFeePercent: 0,
      vatEnabled: false,
      vatPercent: 12,
      isActive: true,
    });
  });

  it('looks up business partners by inn through the backend proxy', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        inn: '123456789',
        companyName: 'Test Company',
        legalName: 'Test Company',
        directorName: 'Director',
        phone: '+998901112233',
        email: 'test@example.com',
        address: 'Tashkent',
        fakturaPayload: { CompanyName: 'Test Company' },
      },
    });

    await apiClient.lookupAdminBusinessPartner('123456789');

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/platform/business-partners/lookup/', {
      params: { inn: '123456789' },
    });
  });

  it('loads business partner activation defaults', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        username: 'bh-123456789',
        password: 'secret123',
      },
    });

    await apiClient.getAdminBusinessPartnerActivationDefaults('partner-1');

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/platform/business-partners/partner-1/activation-defaults/');
  });

  it('sends manual credentials during business partner activation when provided', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        partner: { id: 'partner-1', companyName: 'Partner', status: 'active' },
        username: 'manual-login',
        password: 'manual-pass',
      },
    });

    await apiClient.activateAdminBusinessPartner('partner-1', {
      username: 'manual-login',
      password: 'manual-pass',
    });

    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/platform/business-partners/partner-1/activate/', {
      username: 'manual-login',
      password: 'manual-pass',
    });
  });

  it('activates business partner without a payload body for the legacy flow', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        partner: { id: 'partner-1', companyName: 'Partner', status: 'active' },
        username: 'bh-123456789',
        password: 'secret123',
      },
    });

    await apiClient.activateAdminBusinessPartner('partner-1');

    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/platform/business-partners/partner-1/activate/');
  });

  it('looks up restaurants by tax number through the backend proxy', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        taxNumber: '311926992',
        name: 'GULISTON RESTAURANT',
        legalName: 'GULISTON RESTAURANT',
        phone: '+998337700586',
        address: 'Buxoro',
        fakturaPayload: { CompanyName: 'GULISTON RESTAURANT' },
      },
    });

    await apiClient.lookupAdminRestaurant('311926992');

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/lookup/', {
      params: { taxNumber: '311926992' },
    });
  });

  it('sends billing period during restaurant activation', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        restaurant: { id: 'restaurant-1', name: 'Cafe', isActive: true },
        username: 'admin-cafe',
        password: 'secret123',
      },
    });

    await apiClient.activateAdminRestaurant('restaurant-1', {
      activationType: 'tariff',
      billingPeriod: 'monthly',
      tariffId: 'tariff-1',
      startsOn: '2026-04-07',
    });

    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/platform/restaurants/restaurant-1/activate/', {
      activationType: 'tariff',
      billingPeriod: 'monthly',
      tariffId: 'tariff-1',
      startsOn: '2026-04-07',
    });
  });

  it('extends restaurant subscription without a payload body', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        id: 'restaurant-1',
        name: 'Cafe',
        isActive: true,
        billingPeriod: 'monthly',
        expiresOn: '2026-05-07',
      },
    });

    await apiClient.extendAdminRestaurant('restaurant-1');

    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/platform/restaurants/restaurant-1/extend/');
  });
});
