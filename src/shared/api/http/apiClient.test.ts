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
      periodType: 'month',
      month: '2026-03',
      paymentMethod: 'card',
      ordering: '-total',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/reports/sales/', {
      params: {
        page: 1,
        pageSize: 10,
        periodType: 'month',
        month: '2026-03',
        paymentMethod: 'card',
        ordering: '-total',
        date: undefined,
        year: undefined,
        search: undefined,
        status: undefined,
        hallId: undefined,
        categoryId: undefined,
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
      address: '',
      isActive: true,
    });

    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/constructor/restaurants/', {
      name: 'Cafe',
      legalName: '',
      taxNumber: '',
      phone: '',
      address: '',
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
});
