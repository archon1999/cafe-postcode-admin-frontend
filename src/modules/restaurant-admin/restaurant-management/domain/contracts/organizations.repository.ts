import type {
  AdminCashDesk,
  AdminCashDeskPayload,
  AdminHall,
  AdminIntegrationConfig,
  AdminIntegrationConfigPayload,
  AdminPrepStation,
  AdminPrepStationPayload,
  AdminRestaurant,
  AdminRestaurantListItem,
  AdminRestaurantPayload,
} from 'shared/api/admin-types';

export interface OrganizationsRepository {
  getCashDesks(): Promise<AdminCashDesk[]>;
  getCashDeskById(id: string): Promise<AdminCashDesk>;
  createCashDesk(payload: AdminCashDeskPayload): Promise<AdminCashDesk>;
  updateCashDesk(id: string, payload: AdminCashDeskPayload): Promise<AdminCashDesk>;
  deleteCashDesk(id: string): Promise<void>;
  getPrepStations(): Promise<AdminPrepStation[]>;
  getPrepStationById(id: string): Promise<AdminPrepStation>;
  createPrepStation(payload: AdminPrepStationPayload): Promise<AdminPrepStation>;
  updatePrepStation(id: string, payload: AdminPrepStationPayload): Promise<AdminPrepStation>;
  deletePrepStation(id: string): Promise<void>;
  getIntegrationConfigs(): Promise<AdminIntegrationConfig[]>;
  getIntegrationConfigById(id: string): Promise<AdminIntegrationConfig>;
  createIntegrationConfig(payload: AdminIntegrationConfigPayload): Promise<AdminIntegrationConfig>;
  updateIntegrationConfig(id: string, payload: AdminIntegrationConfigPayload): Promise<AdminIntegrationConfig>;
  deleteIntegrationConfig(id: string): Promise<void>;
  getRestaurants(): Promise<AdminRestaurantListItem[]>;
  getMyRestaurant(): Promise<AdminRestaurant>;
  getRestaurantById(id: string): Promise<AdminRestaurant>;
  createRestaurant(payload: AdminRestaurantPayload): Promise<AdminRestaurant>;
  updateRestaurant(id: string, payload: AdminRestaurantPayload): Promise<AdminRestaurant>;
  updateMyRestaurantSettings(payload: AdminRestaurantPayload): Promise<AdminRestaurant>;
  deleteRestaurant(id: string): Promise<void>;
  getHalls(): Promise<AdminHall[]>;
}
