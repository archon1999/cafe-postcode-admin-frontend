import { afterEach, describe, expect, it, vi } from 'vitest';

import type {
  AdminBusinessPartnerPayload,
  AdminCashDeskPayload,
  AdminDiningTablePayload,
  AdminDistributionPointPayload,
  AdminHallConstructorPayload,
  AdminHallPayload,
  AdminPrepStationPayload,
  AdminTableSessionPayload,
  AdminZoneOrCabinPayload,
} from '../admin-types';

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));
const { postMock } = vi.hoisted(() => ({
  postMock: vi.fn(),
}));
const { putMock } = vi.hoisted(() => ({
  putMock: vi.fn(),
}));
const { patchMock } = vi.hoisted(() => ({
  patchMock: vi.fn(),
}));
const { deleteMock } = vi.hoisted(() => ({
  deleteMock: vi.fn(),
}));

vi.mock('./axiosInstance.ts', () => ({
  instance: {
    get: getMock,
    post: postMock,
    put: putMock,
    patch: patchMock,
    delete: deleteMock,
  },
}));

import { adminBusinessPartnerGateway } from './adminBusinessPartnerGateway';
import { adminCashDeskGateway } from './adminCashDeskGateway';
import { adminCatalogGateway } from './adminCatalogGateway';
import { adminDiningTableGateway } from './adminDiningTableGateway';
import { adminDistributionPointGateway } from './adminDistributionPointGateway';
import { adminHallGateway } from './adminHallGateway';
import { adminIdentityGateway } from './adminIdentityGateway';
import { adminIntegrationGateway } from './adminIntegrationGateway';
import { adminLocalAgentGateway } from './adminLocalAgentGateway';
import { adminOperationsGateway } from './adminOperationsGateway';
import { adminPrepStationGateway } from './adminPrepStationGateway';
import { adminReportGateway } from './adminReportGateway';
import { adminRestaurantGateway } from './adminRestaurantGateway';
import { adminTableSessionGateway } from './adminTableSessionGateway';
import { adminTariffGateway } from './adminTariffGateway';
import { adminZoneGateway } from './adminZoneGateway';
import { apiClient } from './apiClient';

afterEach(() => {
  getMock.mockReset();
  postMock.mockReset();
  putMock.mockReset();
  patchMock.mockReset();
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
      markingCheckEnabled: false,
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
      markingCheckEnabled: false,
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

describe('apiClient local-agent gateway contract', () => {
  it('exposes the exact feature gateway function references', () => {
    expect(apiClient.getAdminLocalAgents).toBe(adminLocalAgentGateway.getAdminLocalAgents);
    expect(apiClient.getAdminLocalAgentDiagnostics).toBe(adminLocalAgentGateway.getAdminLocalAgentDiagnostics);
    expect(apiClient.updateAdminLocalAgentNow).toBe(adminLocalAgentGateway.updateAdminLocalAgentNow);
    expect(apiClient.getAdminLocalAgentLogs).toBe(adminLocalAgentGateway.getAdminLocalAgentLogs);
    expect(apiClient.runAdminLocalAgentBulkAction).toBe(adminLocalAgentGateway.runAdminLocalAgentBulkAction);
  });

  it('maps every list filter and returns response.data by identity', async () => {
    const data = {
      page: 2,
      pageSize: 25,
      count: 1,
      total: 1,
      pagesCount: 1,
      data: [],
    };
    getMock.mockResolvedValueOnce({ data });

    const result = await apiClient.getAdminLocalAgents({
      page: 2,
      pageSize: 25,
      search: 'qamish',
      status: 'online',
      ordering: '-lastSeenAt',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/local-agents/', {
      params: {
        page: 2,
        pageSize: 25,
        search: 'qamish',
        status: 'online',
        ordering: '-lastSeenAt',
      },
    });
    expect(result).toBe(data);
  });

  it('uses exact diagnostics update and logs paths and unwraps each response', async () => {
    const diagnostics = { ok: true, marker: 'diagnostics' };
    const update = { ok: true, marker: 'update' };
    const logs = { ok: true, marker: 'logs' };
    getMock.mockResolvedValueOnce({ data: diagnostics }).mockResolvedValueOnce({ data: logs });
    postMock.mockResolvedValueOnce({ data: update });

    const diagnosticsResult = await apiClient.getAdminLocalAgentDiagnostics('agent-1');
    const updateResult = await apiClient.updateAdminLocalAgentNow('agent-1');
    const logsResult = await apiClient.getAdminLocalAgentLogs('agent-1');

    expect(getMock).toHaveBeenNthCalledWith(1, '/api/v1/admin/local-agents/agent-1/diagnostics/');
    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/local-agents/agent-1/update-now/');
    expect(getMock).toHaveBeenNthCalledWith(2, '/api/v1/admin/local-agents/agent-1/logs/');
    expect(diagnosticsResult).toBe(diagnostics);
    expect(updateResult).toBe(update);
    expect(logsResult).toBe(logs);
  });

  it('posts the exact bulk action body and returns response.data by identity', async () => {
    const data = { ok: true, action: 'restart', succeeded: 2, failed: 0, results: [] };
    postMock.mockResolvedValueOnce({ data });

    const result = await apiClient.runAdminLocalAgentBulkAction('restart', ['agent-1', 'agent-2']);

    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/local-agents/bulk-action/', {
      action: 'restart',
      agentIds: ['agent-1', 'agent-2'],
    });
    expect(result).toBe(data);
  });
});

describe('apiClient integration gateway contract', () => {
  it('exposes the exact feature gateway function references', () => {
    expect(apiClient.getAdminIntegrationConfigs).toBe(adminIntegrationGateway.getAdminIntegrationConfigs);
    expect(apiClient.getAdminIntegrationConfigById).toBe(adminIntegrationGateway.getAdminIntegrationConfigById);
    expect(apiClient.checkLocalAgentPrinter).toBe(adminIntegrationGateway.checkLocalAgentPrinter);
    expect(apiClient.checkAdminMartaConnection).toBe(adminIntegrationGateway.checkAdminMartaConnection);
    expect(apiClient.getAdminFiscalDevices).toBe(adminIntegrationGateway.getAdminFiscalDevices);
    expect(apiClient.createAdminIntegrationConfig).toBe(adminIntegrationGateway.createAdminIntegrationConfig);
    expect(apiClient.updateAdminIntegrationConfig).toBe(adminIntegrationGateway.updateAdminIntegrationConfig);
    expect(apiClient.deleteAdminIntegrationConfig).toBe(adminIntegrationGateway.deleteAdminIntegrationConfig);
  });

  it('maps every config list filter and returns response.data by identity', async () => {
    const data = { page: 2, pageSize: 25, count: 1, total: 1, pagesCount: 1, data: [] };
    getMock.mockResolvedValueOnce({ data });

    const result = await apiClient.getAdminIntegrationConfigs({
      page: 2,
      pageSize: 25,
      search: 'printer',
      kindIn: 'printer,fiscal',
      isEnabled: true,
      ordering: '-provider',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/integrations/configs/', {
      params: {
        page: 2,
        pageSize: 25,
        search: 'printer',
        kindIn: 'printer,fiscal',
        isEnabled: true,
        ordering: '-provider',
      },
    });
    expect(result).toBe(data);
  });

  it('uses exact detail and mutation calls and unwraps every response by identity', async () => {
    const detail = { id: 'integration-1', marker: 'detail' };
    const created = { id: 'integration-2', marker: 'created' };
    const updated = { id: 'integration-1', marker: 'updated' };
    const payload = {
      kind: 'printer' as const,
      provider: 'network-printer',
      isEnabled: true,
      settings: { host: '192.168.1.10', port: 9100 },
    };
    getMock.mockResolvedValueOnce({ data: detail });
    postMock.mockResolvedValueOnce({ data: created });
    putMock.mockResolvedValueOnce({ data: updated });
    deleteMock.mockResolvedValueOnce({ data: undefined });

    const detailResult = await apiClient.getAdminIntegrationConfigById('integration-1');
    const createResult = await apiClient.createAdminIntegrationConfig(payload);
    const updateResult = await apiClient.updateAdminIntegrationConfig('integration-1', payload);
    const deleteResult = await apiClient.deleteAdminIntegrationConfig('integration-1');

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/integrations/configs/integration-1/');
    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/integrations/configs/', payload);
    expect(putMock).toHaveBeenCalledWith('/api/v1/admin/integrations/configs/integration-1/', payload);
    expect(deleteMock).toHaveBeenCalledWith('/api/v1/admin/integrations/configs/integration-1/');
    expect(detailResult).toBe(detail);
    expect(createResult).toBe(created);
    expect(updateResult).toBe(updated);
    expect(deleteResult).toBeUndefined();
  });

  it('posts the exact local printer check payload and returns response.data by identity', async () => {
    const data = { ok: true, printer: 'Kitchen' };
    const payload = { connectionType: 'network', printerName: 'Kitchen', host: '192.168.1.10', port: 9100 };
    postMock.mockResolvedValueOnce({ data });

    const result = await apiClient.checkLocalAgentPrinter(payload);

    expect(postMock).toHaveBeenCalledWith('/api/v1/local-agent/printer/check/', payload);
    expect(result).toBe(data);
  });

  it('normalizes an omitted MARTA endpoint to an empty string and preserves an explicit endpoint', async () => {
    const defaultData = { ok: true, endpointUrl: '' };
    const explicitData = { ok: true, endpointUrl: 'http://192.168.1.20:8080' };
    postMock.mockResolvedValueOnce({ data: defaultData }).mockResolvedValueOnce({ data: explicitData });

    await expect(apiClient.checkAdminMartaConnection()).resolves.toBe(defaultData);
    await expect(apiClient.checkAdminMartaConnection('http://192.168.1.20:8080')).resolves.toBe(explicitData);

    expect(postMock).toHaveBeenNthCalledWith(1, '/api/v1/admin/integrations/marta/check/', { endpointUrl: '' });
    expect(postMock).toHaveBeenNthCalledWith(2, '/api/v1/admin/integrations/marta/check/', {
      endpointUrl: 'http://192.168.1.20:8080',
    });
  });

  it('normalizes an omitted fiscal endpoint to undefined and preserves an explicit endpoint', async () => {
    const defaultData = [{ factoryId: 'factory-1' }];
    const explicitData = [{ factoryId: 'factory-2' }];
    getMock.mockResolvedValueOnce({ data: defaultData }).mockResolvedValueOnce({ data: explicitData });

    await expect(apiClient.getAdminFiscalDevices()).resolves.toBe(defaultData);
    await expect(apiClient.getAdminFiscalDevices('http://127.0.0.1:8001')).resolves.toBe(explicitData);

    expect(getMock).toHaveBeenNthCalledWith(1, '/api/v1/admin/integrations/fiscal-devices/', {
      params: { endpointUrl: undefined },
    });
    expect(getMock).toHaveBeenNthCalledWith(2, '/api/v1/admin/integrations/fiscal-devices/', {
      params: { endpointUrl: 'http://127.0.0.1:8001' },
    });
  });
});

describe('apiClient cash-desk gateway contract', () => {
  it('exposes the exact feature gateway function references', () => {
    expect(apiClient.getAdminCashDesks).toBe(adminCashDeskGateway.getAdminCashDesks);
    expect(apiClient.getAdminCashDeskById).toBe(adminCashDeskGateway.getAdminCashDeskById);
    expect(apiClient.createAdminCashDesk).toBe(adminCashDeskGateway.createAdminCashDesk);
    expect(apiClient.updateAdminCashDesk).toBe(adminCashDeskGateway.updateAdminCashDesk);
    expect(apiClient.deleteAdminCashDesk).toBe(adminCashDeskGateway.deleteAdminCashDesk);
  });

  it('maps every cash-desk list filter and returns response.data by identity', async () => {
    const data = { page: 3, pageSize: 15, count: 1, total: 1, pagesCount: 1, data: [] };
    getMock.mockResolvedValueOnce({ data });

    const result = await apiClient.getAdminCashDesks({
      page: 3,
      pageSize: 15,
      search: 'main',
      isActive: false,
      ordering: 'name',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/cash-desks/', {
      params: {
        page: 3,
        pageSize: 15,
        search: 'main',
        isActive: false,
        ordering: 'name',
      },
    });
    expect(result).toBe(data);
  });

  it('uses exact detail and mutation calls and unwraps every response by identity', async () => {
    const detail = { id: 'cash-desk-1', marker: 'detail' };
    const created = { id: 'cash-desk-2', marker: 'created' };
    const updated = { id: 'cash-desk-1', marker: 'updated' };
    const payload: AdminCashDeskPayload = {
      name: 'Main cash desk',
      fiscalIntegration: 'fiscal-1',
      paymentIntegration: 'payment-1',
      printerIntegration: 'printer-1',
      location: 'Entrance',
      enabledPaymentMethods: ['cash', 'card'],
      fiscalProvider: 'fiscal-drive',
      receiptPrinterEnabled: true,
      terminalId: 'terminal-1',
      externalCashboxId: 'cashbox-1',
      isActive: true,
    };
    getMock.mockResolvedValueOnce({ data: detail });
    postMock.mockResolvedValueOnce({ data: created });
    putMock.mockResolvedValueOnce({ data: updated });
    deleteMock.mockResolvedValueOnce({ data: undefined });

    const detailResult = await apiClient.getAdminCashDeskById('cash-desk-1');
    const createResult = await apiClient.createAdminCashDesk(payload);
    const updateResult = await apiClient.updateAdminCashDesk('cash-desk-1', payload);
    const deleteResult = await apiClient.deleteAdminCashDesk('cash-desk-1');

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/cash-desks/cash-desk-1/');
    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/cash-desks/', payload);
    expect(putMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/cash-desks/cash-desk-1/', payload);
    expect(deleteMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/cash-desks/cash-desk-1/');
    expect(detailResult).toBe(detail);
    expect(createResult).toBe(created);
    expect(updateResult).toBe(updated);
    expect(deleteResult).toBeUndefined();
  });
});

describe('apiClient distribution-point gateway contract', () => {
  it('exposes the exact feature gateway function references', () => {
    expect(apiClient.getAdminDistributionPoints).toBe(adminDistributionPointGateway.getAdminDistributionPoints);
    expect(apiClient.getAdminDistributionPointById).toBe(adminDistributionPointGateway.getAdminDistributionPointById);
    expect(apiClient.createAdminDistributionPoint).toBe(adminDistributionPointGateway.createAdminDistributionPoint);
    expect(apiClient.updateAdminDistributionPoint).toBe(adminDistributionPointGateway.updateAdminDistributionPoint);
    expect(apiClient.deleteAdminDistributionPoint).toBe(adminDistributionPointGateway.deleteAdminDistributionPoint);
  });

  it('maps every distribution-point list filter and returns response.data by identity', async () => {
    const data = { page: 4, pageSize: 10, count: 1, total: 1, pagesCount: 1, data: [] };
    getMock.mockResolvedValueOnce({ data });

    const result = await apiClient.getAdminDistributionPoints({
      page: 4,
      pageSize: 10,
      search: 'delivery',
      kindIn: 'hall,delivery',
      isActive: true,
      ordering: '-name',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/distribution-points/', {
      params: {
        page: 4,
        pageSize: 10,
        search: 'delivery',
        kindIn: 'hall,delivery',
        isActive: true,
        ordering: '-name',
      },
    });
    expect(result).toBe(data);
  });

  it('uses exact detail and mutation calls and unwraps every response by identity', async () => {
    const detail = { id: 'distribution-point-1', marker: 'detail' };
    const created = { id: 'distribution-point-2', marker: 'created' };
    const updated = { id: 'distribution-point-1', marker: 'updated' };
    const payload: AdminDistributionPointPayload = {
      name: 'Delivery',
      kind: 'delivery',
      integrationChannel: 'delivery-channel',
      assignedHall: 'hall-1',
      isActive: true,
    };
    getMock.mockResolvedValueOnce({ data: detail });
    postMock.mockResolvedValueOnce({ data: created });
    putMock.mockResolvedValueOnce({ data: updated });
    deleteMock.mockResolvedValueOnce({ data: undefined });

    const detailResult = await apiClient.getAdminDistributionPointById('distribution-point-1');
    const createResult = await apiClient.createAdminDistributionPoint(payload);
    const updateResult = await apiClient.updateAdminDistributionPoint('distribution-point-1', payload);
    const deleteResult = await apiClient.deleteAdminDistributionPoint('distribution-point-1');

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/distribution-points/distribution-point-1/');
    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/distribution-points/', payload);
    expect(putMock).toHaveBeenCalledWith(
      '/api/v1/admin/restaurants/distribution-points/distribution-point-1/',
      payload,
    );
    expect(deleteMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/distribution-points/distribution-point-1/');
    expect(detailResult).toBe(detail);
    expect(createResult).toBe(created);
    expect(updateResult).toBe(updated);
    expect(deleteResult).toBeUndefined();
  });
});

describe('apiClient prep-station gateway contract', () => {
  it('exposes the exact feature gateway function references', () => {
    expect(apiClient.getAdminPrepStations).toBe(adminPrepStationGateway.getAdminPrepStations);
    expect(apiClient.getAdminPrepStationById).toBe(adminPrepStationGateway.getAdminPrepStationById);
    expect(apiClient.createAdminPrepStation).toBe(adminPrepStationGateway.createAdminPrepStation);
    expect(apiClient.updateAdminPrepStation).toBe(adminPrepStationGateway.updateAdminPrepStation);
    expect(apiClient.deleteAdminPrepStation).toBe(adminPrepStationGateway.deleteAdminPrepStation);
  });

  it('maps every prep-station list filter and returns response.data by identity', async () => {
    const data = { page: 2, pageSize: 30, count: 1, total: 1, pagesCount: 1, data: [] };
    getMock.mockResolvedValueOnce({ data });

    const result = await apiClient.getAdminPrepStations({
      page: 2,
      pageSize: 30,
      search: 'kitchen',
      kindIn: 'kitchen,bar',
      isActive: false,
      ordering: 'name',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/prep-stations/', {
      params: {
        page: 2,
        pageSize: 30,
        search: 'kitchen',
        kindIn: 'kitchen,bar',
        isActive: false,
        ordering: 'name',
      },
    });
    expect(result).toBe(data);
  });

  it('uses exact detail and mutation calls and unwraps every response by identity', async () => {
    const detail = { id: 'prep-station-1', marker: 'detail' };
    const created = { id: 'prep-station-2', marker: 'created' };
    const updated = { id: 'prep-station-1', marker: 'updated' };
    const payload: AdminPrepStationPayload = {
      name: 'Main kitchen',
      kind: 'kitchen',
      printerIntegration: 'printer-1',
      cookIds: ['cook-1', 'cook-2'],
      isActive: true,
    };
    getMock.mockResolvedValueOnce({ data: detail });
    postMock.mockResolvedValueOnce({ data: created });
    putMock.mockResolvedValueOnce({ data: updated });
    deleteMock.mockResolvedValueOnce({ data: undefined });

    const detailResult = await apiClient.getAdminPrepStationById('prep-station-1');
    const createResult = await apiClient.createAdminPrepStation(payload);
    const updateResult = await apiClient.updateAdminPrepStation('prep-station-1', payload);
    const deleteResult = await apiClient.deleteAdminPrepStation('prep-station-1');

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/prep-stations/prep-station-1/');
    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/prep-stations/', payload);
    expect(putMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/prep-stations/prep-station-1/', payload);
    expect(deleteMock).toHaveBeenCalledWith('/api/v1/admin/restaurants/prep-stations/prep-station-1/');
    expect(detailResult).toBe(detail);
    expect(createResult).toBe(created);
    expect(updateResult).toBe(updated);
    expect(deleteResult).toBeUndefined();
  });
});

describe('apiClient table-session gateway contract', () => {
  it('exposes the exact feature gateway function references', () => {
    expect(apiClient.getAdminTableSessions).toBe(adminTableSessionGateway.getAdminTableSessions);
    expect(apiClient.getAdminTableSessionById).toBe(adminTableSessionGateway.getAdminTableSessionById);
    expect(apiClient.createAdminTableSession).toBe(adminTableSessionGateway.createAdminTableSession);
    expect(apiClient.updateAdminTableSession).toBe(adminTableSessionGateway.updateAdminTableSession);
    expect(apiClient.deleteAdminTableSession).toBe(adminTableSessionGateway.deleteAdminTableSession);
  });

  it('maps every table-session list filter and returns response.data by identity', async () => {
    const data = { page: 5, pageSize: 12, count: 1, total: 1, pagesCount: 1, data: [] };
    getMock.mockResolvedValueOnce({ data });

    const result = await apiClient.getAdminTableSessions({
      page: 5,
      pageSize: 12,
      search: 'terrace',
      hallIdIn: 'hall-1,hall-2',
      statusIn: 'open,pending_payment',
      ordering: '-createdAt',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/floor/table-sessions/', {
      params: {
        page: 5,
        pageSize: 12,
        search: 'terrace',
        hallIdIn: 'hall-1,hall-2',
        statusIn: 'open,pending_payment',
        ordering: '-createdAt',
      },
    });
    expect(result).toBe(data);
  });

  it('uses exact detail and mutation calls and unwraps every response by identity', async () => {
    const detail = { id: 'table-session-1', marker: 'detail' };
    const created = { id: 'table-session-2', marker: 'created' };
    const updated = { id: 'table-session-1', marker: 'updated' };
    const payload: AdminTableSessionPayload = {
      hall: 'hall-1',
      table: 'table-1',
      openedBy: 'cashier-1',
      assignedWaiter: 'waiter-1',
      guestCount: 4,
      status: 'open',
      note: 'Window table',
      mergedInto: null,
      closedAt: null,
    };
    getMock.mockResolvedValueOnce({ data: detail });
    postMock.mockResolvedValueOnce({ data: created });
    putMock.mockResolvedValueOnce({ data: updated });
    deleteMock.mockResolvedValueOnce({ data: undefined });

    const detailResult = await apiClient.getAdminTableSessionById('table-session-1');
    const createResult = await apiClient.createAdminTableSession(payload);
    const updateResult = await apiClient.updateAdminTableSession('table-session-1', payload);
    const deleteResult = await apiClient.deleteAdminTableSession('table-session-1');

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/floor/table-sessions/table-session-1/');
    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/floor/table-sessions/', payload);
    expect(putMock).toHaveBeenCalledWith('/api/v1/admin/floor/table-sessions/table-session-1/', payload);
    expect(deleteMock).toHaveBeenCalledWith('/api/v1/admin/floor/table-sessions/table-session-1/');
    expect(detailResult).toBe(detail);
    expect(createResult).toBe(created);
    expect(updateResult).toBe(updated);
    expect(deleteResult).toBeUndefined();
  });
});

describe('apiClient dining-table gateway contract', () => {
  it('exposes the exact feature gateway function references', () => {
    expect(apiClient.getAdminDiningTables).toBe(adminDiningTableGateway.getAdminDiningTables);
    expect(apiClient.getAdminDiningTableById).toBe(adminDiningTableGateway.getAdminDiningTableById);
    expect(apiClient.createAdminDiningTable).toBe(adminDiningTableGateway.createAdminDiningTable);
    expect(apiClient.updateAdminDiningTable).toBe(adminDiningTableGateway.updateAdminDiningTable);
    expect(apiClient.deleteAdminDiningTable).toBe(adminDiningTableGateway.deleteAdminDiningTable);
  });

  it('maps every dining-table list filter and returns response.data by identity', async () => {
    const data = { page: 6, pageSize: 24, count: 1, total: 1, pagesCount: 1, data: [] };
    getMock.mockResolvedValueOnce({ data });

    const result = await apiClient.getAdminDiningTables({
      page: 6,
      pageSize: 24,
      search: 'window',
      hallIdIn: 'hall-1,hall-2',
      shapeIn: 'round,rectangle',
      statusIn: 'available,reserved',
      ordering: 'tableNumber',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/floor/tables/', {
      params: {
        page: 6,
        pageSize: 24,
        search: 'window',
        hallIdIn: 'hall-1,hall-2',
        shapeIn: 'round,rectangle',
        statusIn: 'available,reserved',
        ordering: 'tableNumber',
      },
    });
    expect(result).toBe(data);
  });

  it('uses exact detail and mutation calls and unwraps every response by identity', async () => {
    const detail = { id: 'table-1', marker: 'detail' };
    const created = { id: 'table-2', marker: 'created' };
    const updated = { id: 'table-1', marker: 'updated' };
    const payload: AdminDiningTablePayload = {
      hall: 'hall-1',
      name: 'Window 1',
      tableNumber: 7,
      seatCount: 4,
      shape: 'rectangle',
      shapeVariant: 'seat4_horizontal',
      status: 'available',
      positionX: 100,
      positionY: 120,
      width: 140,
      height: 80,
      rotation: 0,
      isActive: true,
    };
    getMock.mockResolvedValueOnce({ data: detail });
    postMock.mockResolvedValueOnce({ data: created });
    putMock.mockResolvedValueOnce({ data: updated });
    deleteMock.mockResolvedValueOnce({ data: undefined });

    const detailResult = await apiClient.getAdminDiningTableById('table-1');
    const createResult = await apiClient.createAdminDiningTable(payload);
    const updateResult = await apiClient.updateAdminDiningTable('table-1', payload);
    const deleteResult = await apiClient.deleteAdminDiningTable('table-1');

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/floor/tables/table-1/');
    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/floor/tables/', payload);
    expect(putMock).toHaveBeenCalledWith('/api/v1/admin/floor/tables/table-1/', payload);
    expect(deleteMock).toHaveBeenCalledWith('/api/v1/admin/floor/tables/table-1/');
    expect(detailResult).toBe(detail);
    expect(createResult).toBe(created);
    expect(updateResult).toBe(updated);
    expect(deleteResult).toBeUndefined();
  });
});

describe('apiClient hall gateway contract', () => {
  it('exposes the exact feature gateway function references', () => {
    expect(apiClient.getAdminHalls).toBe(adminHallGateway.getAdminHalls);
    expect(apiClient.getAdminHallById).toBe(adminHallGateway.getAdminHallById);
    expect(apiClient.getAdminHallConstructor).toBe(adminHallGateway.getAdminHallConstructor);
    expect(apiClient.createAdminHall).toBe(adminHallGateway.createAdminHall);
    expect(apiClient.updateAdminHall).toBe(adminHallGateway.updateAdminHall);
    expect(apiClient.updateAdminHallSortOrder).toBe(adminHallGateway.updateAdminHallSortOrder);
    expect(apiClient.updateAdminHallConstructor).toBe(adminHallGateway.updateAdminHallConstructor);
    expect(apiClient.deleteAdminHall).toBe(adminHallGateway.deleteAdminHall);
  });

  it('maps every hall list filter and returns response.data by identity', async () => {
    const data = { page: 3, pageSize: 18, count: 1, total: 1, pagesCount: 1, data: [] };
    getMock.mockResolvedValueOnce({ data });

    const result = await apiClient.getAdminHalls({
      page: 3,
      pageSize: 18,
      search: 'terrace',
      isActive: false,
      ordering: '-sortOrder',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/floor/halls/', {
      params: {
        page: 3,
        pageSize: 18,
        search: 'terrace',
        isActive: false,
        ordering: '-sortOrder',
      },
    });
    expect(result).toBe(data);
  });

  it('uses exact detail and constructor GET calls and returns both responses by identity', async () => {
    const detail = { id: 'hall-1', marker: 'detail' };
    const constructor = { hallId: 'hall-1', marker: 'constructor' };
    getMock.mockResolvedValueOnce({ data: detail }).mockResolvedValueOnce({ data: constructor });

    const detailResult = await apiClient.getAdminHallById('hall-1');
    const constructorResult = await apiClient.getAdminHallConstructor('hall-1');

    expect(getMock).toHaveBeenNthCalledWith(1, '/api/v1/admin/floor/halls/hall-1/');
    expect(getMock).toHaveBeenNthCalledWith(2, '/api/v1/admin/floor/halls/hall-1/constructor/');
    expect(detailResult).toBe(detail);
    expect(constructorResult).toBe(constructor);
  });

  it('uses exact create, update, constructor-update and delete calls', async () => {
    const hallPayload: AdminHallPayload = {
      name: 'Terrace',
      description: 'Open-air hall',
      gridColumns: 24,
      sortOrder: 2,
      isActive: true,
      zoneOrCabinId: 'zone-1',
    };
    const constructorPayload: AdminHallConstructorPayload = {
      gridColumns: 24,
      tables: [
        {
          id: 'table-1',
          name: 'T1',
          tableNumber: 1,
          seatCount: 4,
          shapeVariant: 'seat4_square',
          positionX: 10,
          positionY: 20,
          width: 100,
          height: 100,
          isActive: true,
        },
      ],
      deletedTableIds: ['table-deleted'],
    };
    const created = { id: 'hall-2', marker: 'created' };
    const updated = { id: 'hall-1', marker: 'updated' };
    const constructorUpdated = { hallId: 'hall-1', marker: 'constructor-updated' };
    postMock.mockResolvedValueOnce({ data: created });
    putMock.mockResolvedValueOnce({ data: updated }).mockResolvedValueOnce({ data: constructorUpdated });
    deleteMock.mockResolvedValueOnce({ data: undefined });

    const createResult = await apiClient.createAdminHall(hallPayload);
    const updateResult = await apiClient.updateAdminHall('hall-1', hallPayload);
    const constructorResult = await apiClient.updateAdminHallConstructor('hall-1', constructorPayload);
    const deleteResult = await apiClient.deleteAdminHall('hall-1');

    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/floor/halls/', hallPayload);
    expect(putMock).toHaveBeenNthCalledWith(1, '/api/v1/admin/floor/halls/hall-1/', hallPayload);
    expect(putMock).toHaveBeenNthCalledWith(2, '/api/v1/admin/floor/halls/hall-1/constructor/', constructorPayload);
    expect(deleteMock).toHaveBeenCalledWith('/api/v1/admin/floor/halls/hall-1/');
    expect(createResult).toBe(created);
    expect(updateResult).toBe(updated);
    expect(constructorResult).toBe(constructorUpdated);
    expect(deleteResult).toBeUndefined();
  });
});

describe('apiClient zone gateway contract', () => {
  it('exposes the exact feature gateway function references', () => {
    expect(apiClient.getAdminZones).toBe(adminZoneGateway.getAdminZones);
    expect(apiClient.getAdminZoneById).toBe(adminZoneGateway.getAdminZoneById);
    expect(apiClient.createAdminZone).toBe(adminZoneGateway.createAdminZone);
    expect(apiClient.updateAdminZone).toBe(adminZoneGateway.updateAdminZone);
    expect(apiClient.updateAdminZoneSortOrder).toBe(adminZoneGateway.updateAdminZoneSortOrder);
    expect(apiClient.deleteAdminZone).toBe(adminZoneGateway.deleteAdminZone);
  });

  it('preserves the zone list query mapping, including the snake-case active filter', async () => {
    const data = { page: 2, pageSize: 15, count: 1, total: 1, pagesCount: 1, data: [] };
    getMock.mockResolvedValueOnce({ data });

    const result = await apiClient.getAdminZones({
      page: 2,
      pageSize: 15,
      search: 'cabin',
      isActive: false,
      ordering: '-name',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/floor/zones/', {
      params: {
        page: 2,
        pageSize: 15,
        search: 'cabin',
        is_active: false,
        ordering: '-name',
      },
    });
    expect(result).toBe(data);
  });

  it('uses exact detail and mutation calls and unwraps every response by identity', async () => {
    const payload: AdminZoneOrCabinPayload = {
      name: 'Cabin',
      sortOrder: 3,
      isActive: true,
    };
    const detail = { id: 'zone-1', marker: 'detail' };
    const created = { id: 'zone-2', marker: 'created' };
    const updated = { id: 'zone-1', marker: 'updated' };
    getMock.mockResolvedValueOnce({ data: detail });
    postMock.mockResolvedValueOnce({ data: created });
    putMock.mockResolvedValueOnce({ data: updated });
    deleteMock.mockResolvedValueOnce({ data: undefined });

    const detailResult = await apiClient.getAdminZoneById('zone-1');
    const createResult = await apiClient.createAdminZone(payload);
    const updateResult = await apiClient.updateAdminZone('zone-1', payload);
    const deleteResult = await apiClient.deleteAdminZone('zone-1');

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/floor/zones/zone-1/');
    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/floor/zones/', payload);
    expect(putMock).toHaveBeenCalledWith('/api/v1/admin/floor/zones/zone-1/', payload);
    expect(deleteMock).toHaveBeenCalledWith('/api/v1/admin/floor/zones/zone-1/');
    expect(detailResult).toBe(detail);
    expect(createResult).toBe(created);
    expect(updateResult).toBe(updated);
    expect(deleteResult).toBeUndefined();
  });
});

describe('apiClient business-partner gateway contract', () => {
  it('exposes the exact feature gateway function references', () => {
    expect(apiClient.getAdminBusinessPartners).toBe(adminBusinessPartnerGateway.getAdminBusinessPartners);
    expect(apiClient.getAdminBusinessPartnerById).toBe(adminBusinessPartnerGateway.getAdminBusinessPartnerById);
    expect(apiClient.lookupAdminBusinessPartner).toBe(adminBusinessPartnerGateway.lookupAdminBusinessPartner);
    expect(apiClient.createAdminBusinessPartner).toBe(adminBusinessPartnerGateway.createAdminBusinessPartner);
    expect(apiClient.updateAdminBusinessPartner).toBe(adminBusinessPartnerGateway.updateAdminBusinessPartner);
    expect(apiClient.getAdminBusinessPartnerActivationDefaults).toBe(
      adminBusinessPartnerGateway.getAdminBusinessPartnerActivationDefaults,
    );
    expect(apiClient.activateAdminBusinessPartner).toBe(adminBusinessPartnerGateway.activateAdminBusinessPartner);
    expect(apiClient.deactivateAdminBusinessPartner).toBe(adminBusinessPartnerGateway.deactivateAdminBusinessPartner);
    expect(apiClient.resetAdminBusinessPartnerPassword).toBe(
      adminBusinessPartnerGateway.resetAdminBusinessPartnerPassword,
    );
  });

  it('preserves list filters and core CRUD calls', async () => {
    const list = { page: 4, pageSize: 25, count: 0, total: 0, pagesCount: 0, data: [] };
    const detail = { id: 'partner-1', marker: 'detail' };
    const created = { id: 'partner-2', marker: 'created' };
    const updated = { id: 'partner-1', marker: 'updated' };
    const payload: AdminBusinessPartnerPayload = {
      inn: '123456789',
      companyName: 'Partner',
      legalName: 'Partner LLC',
      directorName: 'Director',
      phone: '+998901234567',
      email: 'partner@example.com',
      address: 'Tashkent',
      customTariffAllowed: true,
    };
    getMock.mockResolvedValueOnce({ data: list }).mockResolvedValueOnce({ data: detail });
    postMock.mockResolvedValueOnce({ data: created });
    putMock.mockResolvedValueOnce({ data: updated });

    const listResult = await apiClient.getAdminBusinessPartners({
      page: 4,
      pageSize: 25,
      search: 'partner',
      isActive: true,
      ordering: '-createdAt',
    });
    const detailResult = await apiClient.getAdminBusinessPartnerById('partner-1');
    const createResult = await apiClient.createAdminBusinessPartner(payload);
    const updateResult = await apiClient.updateAdminBusinessPartner('partner-1', payload);

    expect(getMock).toHaveBeenNthCalledWith(1, '/api/v1/admin/platform/business-partners/', {
      params: { page: 4, pageSize: 25, search: 'partner', isActive: true, ordering: '-createdAt' },
    });
    expect(getMock).toHaveBeenNthCalledWith(2, '/api/v1/admin/platform/business-partners/partner-1/');
    expect(postMock).toHaveBeenCalledWith('/api/v1/admin/platform/business-partners/', payload);
    expect(putMock).toHaveBeenCalledWith('/api/v1/admin/platform/business-partners/partner-1/', payload);
    expect(listResult).toBe(list);
    expect(detailResult).toBe(detail);
    expect(createResult).toBe(created);
    expect(updateResult).toBe(updated);
  });

  it('preserves deactivate and password reset action calls', async () => {
    const credentials = { username: 'partner', password: 'secret' };
    postMock.mockResolvedValueOnce({ data: undefined }).mockResolvedValueOnce({ data: credentials });

    const deactivateResult = await apiClient.deactivateAdminBusinessPartner('partner-1');
    const resetResult = await apiClient.resetAdminBusinessPartnerPassword('partner-1');

    expect(postMock).toHaveBeenNthCalledWith(1, '/api/v1/admin/platform/business-partners/partner-1/deactivate/');
    expect(postMock).toHaveBeenNthCalledWith(2, '/api/v1/admin/platform/business-partners/partner-1/reset-password/');
    expect(deactivateResult).toBeUndefined();
    expect(resetResult).toBe(credentials);
  });
});

describe('apiClient reporting gateway contract', () => {
  it('exposes all report feature functions through the facade by identity', () => {
    const methods = [
      'getAdminReportSummary',
      'exportAdminReportSummary',
      'getAdminSalesReport',
      'exportAdminSalesReport',
      'getAdminOpenChecksReport',
      'exportAdminOpenChecksReport',
      'getAdminReceiptsReport',
      'exportAdminReceiptsReport',
      'getAdminTopItemsReport',
      'exportAdminTopItemsReport',
      'getAdminTopStaffReport',
      'exportAdminTopStaffReport',
      'getAdminPaymentBreakdownReport',
      'exportAdminPaymentBreakdownReport',
      'getAdminShiftReport',
      'exportAdminShiftReport',
    ] as const;

    methods.forEach((method) => expect(apiClient[method]).toBe(adminReportGateway[method]));
  });

  it('preserves report export parameters and decodes the response filename', async () => {
    const blob = { marker: 'blob' } as unknown as Blob;
    getMock.mockResolvedValueOnce({
      data: blob,
      headers: { 'content-disposition': 'attachment; filename="sales%20july.xlsx"' },
    });

    const result = await apiClient.exportAdminSalesReport({
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      paymentMethod: 'card',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/reporting/sales/export/', {
      params: {
        startDate: '2026-07-01',
        endDate: '2026-07-31',
        search: undefined,
        ordering: undefined,
        page: undefined,
        pageSize: undefined,
        paymentMethod: 'card',
        receiptKind: undefined,
        status: undefined,
        hallId: undefined,
        categoryId: undefined,
        cashDeskId: undefined,
        cashierId: undefined,
        differenceOnly: undefined,
      },
      responseType: 'blob',
    });
    expect(result).toEqual({ blob, filename: 'sales july.xlsx' });
  });
});

describe('apiClient tariff and catalog gateway contracts', () => {
  it('exposes every extracted function through the facade by identity', () => {
    const tariffMethods = [
      'getAdminTariffs',
      'getAdminTariffById',
      'getAdminTariffOptions',
      'createAdminTariff',
      'updateAdminTariff',
    ] as const;
    const catalogMethods = [
      'getAdminCatalogCategories',
      'getAdminCatalogCategoryById',
      'createAdminCatalogCategory',
      'updateAdminCatalogCategory',
      'updateAdminCatalogCategorySortOrder',
      'deleteAdminCatalogCategory',
      'getAdminCatalogItems',
      'getAdminCatalogItemById',
      'createAdminCatalogItem',
      'updateAdminCatalogItem',
      'updateAdminCatalogItemSortOrder',
      'deleteAdminCatalogItem',
    ] as const;

    tariffMethods.forEach((method) => expect(apiClient[method]).toBe(adminTariffGateway[method]));
    catalogMethods.forEach((method) => expect(apiClient[method]).toBe(adminCatalogGateway[method]));
  });

  it('preserves tariff and catalog item list filters', async () => {
    const tariffs = { page: 2, pageSize: 10, count: 0, total: 0, pagesCount: 0, data: [] };
    const items = { page: 3, pageSize: 30, count: 0, total: 0, pagesCount: 0, data: [] };
    getMock.mockResolvedValueOnce({ data: tariffs }).mockResolvedValueOnce({ data: items });

    const tariffResult = await apiClient.getAdminTariffs({
      page: 2,
      pageSize: 10,
      search: 'pro',
      isActive: true,
      ordering: 'monthlyPrice',
    });
    const itemResult = await apiClient.getAdminCatalogItems({
      page: 3,
      pageSize: 30,
      search: 'osh',
      categoryIdIn: 'cat-1,cat-2',
      isActive: true,
      isStoplisted: false,
      ordering: '-createdAt',
    });

    expect(getMock).toHaveBeenNthCalledWith(1, '/api/v1/admin/platform/tariffs/', {
      params: { page: 2, pageSize: 10, search: 'pro', isActive: true, ordering: 'monthlyPrice' },
    });
    expect(getMock).toHaveBeenNthCalledWith(2, '/api/v1/admin/catalog/items/', {
      params: {
        page: 3,
        pageSize: 30,
        search: 'osh',
        categoryIdIn: 'cat-1,cat-2',
        isActive: true,
        isStoplisted: false,
        ordering: '-createdAt',
      },
    });
    expect(tariffResult).toBe(tariffs);
    expect(itemResult).toBe(items);
  });

  it('normalizes tariff option collection envelopes and direct arrays', async () => {
    const wrapped = [{ id: 'tariff-1' }];
    const direct = [{ id: 'tariff-2' }];
    getMock.mockResolvedValueOnce({ data: { data: wrapped } }).mockResolvedValueOnce({ data: direct });

    expect(await apiClient.getAdminTariffOptions()).toBe(wrapped);
    expect(await apiClient.getAdminTariffOptions()).toBe(direct);
  });
});

describe('apiClient identity, restaurant and operations gateway contracts', () => {
  it('exposes every remaining gateway function through the facade by identity', () => {
    const identityMethods = [
      'loginAdmin',
      'logoutAdmin',
      'getAdminMe',
      'getAdminMyRestaurant',
      'getAdminUsers',
      'getAdminUserById',
      'createAdminUser',
      'updateAdminUser',
      'getAdminEmployees',
      'getAdminEmployeeById',
      'createAdminEmployee',
      'updateAdminEmployee',
      'getAdminRoles',
      'getAdminEmployeeRoles',
      'getAdminRolesPage',
      'getAdminRoleById',
      'createAdminRole',
      'updateAdminRole',
      'deleteAdminRole',
      'getAdminPermissions',
      'getAdminPermissionsPage',
    ] as const;
    const restaurantMethods = [
      'getAdminRestaurants',
      'getAdminRestaurantById',
      'getAdminRestaurantDetail',
      'lookupAdminRestaurant',
      'createAdminRestaurant',
      'updateAdminRestaurant',
      'updateAdminRestaurantSettings',
      'deleteAdminRestaurant',
      'activateAdminRestaurant',
      'getAdminRestaurantActivationOptions',
      'rotateAdminRestaurantAuthCode',
      'deactivateAdminRestaurant',
      'extendAdminRestaurant',
      'resetAdminRestaurantPassword',
      'getAdminRestaurantBalanceTransactions',
      'topUpAdminRestaurantBalance',
    ] as const;
    const operationMethods = [
      'getAdminKitchenTickets',
      'getAdminKitchenTicketById',
      'getAdminOrders',
      'getAdminOrderById',
      'getAdminOrderItems',
      'getAdminOrderItemById',
      'getAdminOrderItemNotes',
      'getAdminOrderItemNoteById',
      'getAdminPayments',
      'getAdminPaymentById',
      'retryAdminPaymentFiscal',
      'getAdminReceipts',
      'getAdminReceiptById',
    ] as const;

    identityMethods.forEach((method) => expect(apiClient[method]).toBe(adminIdentityGateway[method]));
    restaurantMethods.forEach((method) => expect(apiClient[method]).toBe(adminRestaurantGateway[method]));
    operationMethods.forEach((method) => expect(apiClient[method]).toBe(adminOperationsGateway[method]));
  });

  it('preserves employee snake-case filters through the shared user mapper', async () => {
    const data = { page: 2, pageSize: 20, count: 0, total: 0, pagesCount: 0, data: [] };
    getMock.mockResolvedValueOnce({ data });

    const result = await apiClient.getAdminEmployees({
      page: 2,
      pageSize: 20,
      search: 'cashier',
      roleIdIn: 'role-1',
      employmentStatusIn: 'active',
      ordering: '-createdAt',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/employees/', {
      params: {
        page: 2,
        pageSize: 20,
        search: 'cashier',
        role_id_in: 'role-1',
        employment_status_in: 'active',
        ordering: '-createdAt',
      },
    });
    expect(result).toBe(data);
  });

  it('preserves restaurant balance transaction filters', async () => {
    const data = { page: 1, pageSize: 50, count: 0, total: 0, pagesCount: 0, data: [] };
    getMock.mockResolvedValueOnce({ data });

    const result = await apiClient.getAdminRestaurantBalanceTransactions('restaurant-1', {
      page: 1,
      pageSize: 50,
      search: 'top-up',
      ordering: '-createdAt',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/platform/restaurants/restaurant-1/balance-transactions/', {
      params: { page: 1, pageSize: 50, search: 'top-up', ordering: '-createdAt' },
    });
    expect(result).toBe(data);
  });

  it('preserves kitchen ticket filters', async () => {
    const data = { page: 1, pageSize: 25, count: 0, total: 0, pagesCount: 0, data: [] };
    getMock.mockResolvedValueOnce({ data });

    const result = await apiClient.getAdminKitchenTickets({
      page: 1,
      pageSize: 25,
      search: 'ticket',
      statusIn: 'new,ready',
      prepStationIdIn: 'station-1',
      routedViaIn: 'printer',
      isPrinted: true,
      ordering: '-createdAt',
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1/admin/kitchen/tickets/', {
      params: {
        page: 1,
        pageSize: 25,
        search: 'ticket',
        statusIn: 'new,ready',
        prepStationIdIn: 'station-1',
        routedViaIn: 'printer',
        isPrinted: true,
        ordering: '-createdAt',
      },
    });
    expect(result).toBe(data);
  });
});
