import { apiClient } from 'shared/api/http/apiClient';

import type { FloorRepository } from '../../domain';

export const floorRepository: FloorRepository = {
  getBranches() {
    return apiClient.getAdminBranches({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
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
  createHall(payload) {
    return apiClient.createAdminHall(payload);
  },
  updateHall(id, payload) {
    return apiClient.updateAdminHall(id, payload);
  },
  updateHallConstructor(id, payload) {
    return apiClient.updateAdminHallConstructor(id, payload);
  },
  deleteHall(id) {
    return apiClient.deleteAdminHall(id);
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
