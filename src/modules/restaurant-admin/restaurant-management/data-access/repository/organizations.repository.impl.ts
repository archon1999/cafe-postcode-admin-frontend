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
  getDevices() {
    return apiClient.getAdminDevices({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
  getDeviceById(id) {
    return apiClient.getAdminDeviceById(id);
  },
  createDevice(payload) {
    return apiClient.createAdminDevice(payload);
  },
  updateDevice(id, payload) {
    return apiClient.updateAdminDevice(id, payload);
  },
  deleteDevice(id) {
    return apiClient.deleteAdminDevice(id);
  },
  getDistributionPoints() {
    return apiClient.getAdminDistributionPoints({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
  getDistributionPointById(id) {
    return apiClient.getAdminDistributionPointById(id);
  },
  createDistributionPoint(payload) {
    return apiClient.createAdminDistributionPoint(payload);
  },
  updateDistributionPoint(id, payload) {
    return apiClient.updateAdminDistributionPoint(id, payload);
  },
  deleteDistributionPoint(id) {
    return apiClient.deleteAdminDistributionPoint(id);
  },
  getFeatureConfigs() {
    return apiClient.getAdminFeatureConfigs({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
  getFeatureConfigById(id) {
    return apiClient.getAdminFeatureConfigById(id);
  },
  createFeatureConfig(payload) {
    return apiClient.createAdminFeatureConfig(payload);
  },
  updateFeatureConfig(id, payload) {
    return apiClient.updateAdminFeatureConfig(id, payload);
  },
  deleteFeatureConfig(id) {
    return apiClient.deleteAdminFeatureConfig(id);
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
    return apiClient.createAdminRestaurant(payload);
  },
  updateRestaurant(id, payload) {
    return apiClient.updateAdminRestaurant(id, payload);
  },
  deleteRestaurant(id) {
    return apiClient.deleteAdminRestaurant(id);
  },
  getRestaurantFeatureConfig(restaurantId) {
    return apiClient.getAdminRestaurantFeatureConfig(restaurantId);
  },
  upsertRestaurantFeatureConfig(restaurantId, payload) {
    return apiClient.upsertAdminRestaurantFeatureConfig(restaurantId, payload);
  },
  getHalls() {
    return apiClient.getAdminHalls({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
};
