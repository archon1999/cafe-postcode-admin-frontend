import { apiClient } from 'shared/api/http/apiClient';

import type { FloorRepository } from '../../domain';

export const floorRepository: FloorRepository = {
  getUsers() {
    return apiClient.getAdminUsers({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
  getHalls() {
    return apiClient.getAdminHalls({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
  getHallById(id) {
    return apiClient.getAdminHallById(id);
  },
  getHallConstructor(id) {
    return apiClient.getAdminHallConstructor(id);
  },
  getZones() {
    return apiClient.getAdminZones({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
  getZoneById(id) {
    return apiClient.getAdminZoneById(id);
  },
  createHall(payload) {
    return apiClient.createAdminHall(payload);
  },
  updateHall(id, payload) {
    return apiClient.updateAdminHall(id, payload);
  },
  updateHallSortOrder(id, sortOrder) {
    return apiClient.updateAdminHallSortOrder(id, sortOrder);
  },
  updateHallConstructor(id, payload) {
    return apiClient.updateAdminHallConstructor(id, payload);
  },
  deleteHall(id) {
    return apiClient.deleteAdminHall(id);
  },
  createZone(payload) {
    return apiClient.createAdminZone(payload);
  },
  updateZone(id, payload) {
    return apiClient.updateAdminZone(id, payload);
  },
  updateZoneSortOrder(id, sortOrder) {
    return apiClient.updateAdminZoneSortOrder(id, sortOrder);
  },
  deleteZone(id) {
    return apiClient.deleteAdminZone(id);
  },
  getDiningTables() {
    return apiClient.getAdminDiningTables({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
  getDiningTableById(id) {
    return apiClient.getAdminDiningTableById(id);
  },
  createDiningTable(payload) {
    return apiClient.createAdminDiningTable(payload);
  },
  updateDiningTable(id, payload) {
    return apiClient.updateAdminDiningTable(id, payload);
  },
  deleteDiningTable(id) {
    return apiClient.deleteAdminDiningTable(id);
  },
  getTableSessions() {
    return apiClient.getAdminTableSessions({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
  getTableSessionById(id) {
    return apiClient.getAdminTableSessionById(id);
  },
  createTableSession(payload) {
    return apiClient.createAdminTableSession(payload);
  },
  updateTableSession(id, payload) {
    return apiClient.updateAdminTableSession(id, payload);
  },
  deleteTableSession(id) {
    return apiClient.deleteAdminTableSession(id);
  },
};
