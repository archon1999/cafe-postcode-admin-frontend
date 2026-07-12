import {
  buildAdminRestaurantRequestPayload,
  buildRestaurantSelfServiceRequestPayload,
} from 'shared/api/admin-restaurant-form-data';
import { apiClient } from 'shared/api/http/apiClient';

import type { OrganizationsRepository } from '../../domain';

export const organizationsRepository: OrganizationsRepository = {
  getCashDesks() {
    return apiClient.getAdminCashDesks({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
  getCashDeskById(id) {
    return apiClient.getAdminCashDeskById(id);
  },
  createCashDesk(payload) {
    return apiClient.createAdminCashDesk(payload);
  },
  updateCashDesk(id, payload) {
    return apiClient.updateAdminCashDesk(id, payload);
  },
  deleteCashDesk(id) {
    return apiClient.deleteAdminCashDesk(id);
  },
  getPrepStations() {
    return apiClient.getAdminPrepStations({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
  getPrepStationById(id) {
    return apiClient.getAdminPrepStationById(id);
  },
  createPrepStation(payload) {
    return apiClient.createAdminPrepStation(payload);
  },
  updatePrepStation(id, payload) {
    return apiClient.updateAdminPrepStation(id, payload);
  },
  deletePrepStation(id) {
    return apiClient.deleteAdminPrepStation(id);
  },
  getIntegrationConfigs() {
    return apiClient.getAdminIntegrationConfigs({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
  getIntegrationConfigById(id) {
    return apiClient.getAdminIntegrationConfigById(id);
  },
  createIntegrationConfig(payload) {
    return apiClient.createAdminIntegrationConfig(payload);
  },
  updateIntegrationConfig(id, payload) {
    return apiClient.updateAdminIntegrationConfig(id, payload);
  },
  deleteIntegrationConfig(id) {
    return apiClient.deleteAdminIntegrationConfig(id);
  },
  getRestaurants() {
    return apiClient.getAdminRestaurants({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
  getMyRestaurant() {
    return apiClient.getAdminMyRestaurant();
  },
  getRestaurantById(id) {
    return apiClient.getAdminRestaurantById(id);
  },
  createRestaurant(payload) {
    return apiClient.createAdminRestaurant(buildAdminRestaurantRequestPayload(payload));
  },
  updateRestaurant(id, payload) {
    return apiClient.updateAdminRestaurant(id, buildAdminRestaurantRequestPayload(payload));
  },
  updateMyRestaurantSettings(payload) {
    return apiClient.updateAdminRestaurantSettings(buildRestaurantSelfServiceRequestPayload(payload));
  },
  deleteRestaurant(id) {
    return apiClient.deleteAdminRestaurant(id);
  },
  getHalls() {
    return apiClient.getAdminHalls({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
};
