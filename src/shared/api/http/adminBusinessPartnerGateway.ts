import type {
  AdminBusinessPartner,
  AdminBusinessPartnerLookupResult,
  AdminBusinessPartnerPayload,
  AdminBusinessPartnersQueryParams,
  AdminPaginatedResponse,
  AdminPartnerActivationDefaults,
  AdminPartnerActivationResult,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

const baseUrl = '/api/v1/admin/platform/business-partners/';

export const adminBusinessPartnerGateway = {
  getAdminBusinessPartners(params?: AdminBusinessPartnersQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminBusinessPartner>>(baseUrl, {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          isActive: params?.isActive,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminBusinessPartnerById(id: string) {
    return instance.get<AdminBusinessPartner>(`${baseUrl}${id}/`).then((response) => response.data);
  },

  lookupAdminBusinessPartner(inn: string) {
    return instance
      .get<AdminBusinessPartnerLookupResult>(`${baseUrl}lookup/`, { params: { inn } })
      .then((response) => response.data);
  },

  createAdminBusinessPartner(payload: AdminBusinessPartnerPayload) {
    return instance.post<AdminBusinessPartner>(baseUrl, payload).then((response) => response.data);
  },

  updateAdminBusinessPartner(id: string, payload: AdminBusinessPartnerPayload) {
    return instance.put<AdminBusinessPartner>(`${baseUrl}${id}/`, payload).then((response) => response.data);
  },

  getAdminBusinessPartnerActivationDefaults(id: string) {
    return instance
      .get<AdminPartnerActivationDefaults>(`${baseUrl}${id}/activation-defaults/`)
      .then((response) => response.data);
  },

  activateAdminBusinessPartner(id: string, payload?: AdminPartnerActivationDefaults) {
    const request = payload
      ? instance.post<AdminPartnerActivationResult>(`${baseUrl}${id}/activate/`, payload)
      : instance.post<AdminPartnerActivationResult>(`${baseUrl}${id}/activate/`);

    return request.then((response) => response.data);
  },

  deactivateAdminBusinessPartner(id: string) {
    return instance.post<void>(`${baseUrl}${id}/deactivate/`).then((response) => response.data);
  },

  resetAdminBusinessPartnerPassword(id: string) {
    return instance
      .post<AdminPartnerActivationResult>(`${baseUrl}${id}/reset-password/`)
      .then((response) => response.data);
  },
};
