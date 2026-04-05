import type {
  AdminCashDesk,
  AdminCashDeskPayload,
  AdminDevice,
  AdminDevicePayload,
  AdminDistributionPoint,
  AdminDistributionPointPayload,
  AdminHall,
  AdminPrepStation,
  AdminPrepStationPayload,
  AdminRestaurant,
  AdminRestaurantPayload,
} from 'shared/api/admin-types';

export interface OrganizationsRepository {
  getCashDesks(): Promise<AdminCashDesk[]>;
  getCashDeskById(id: string): Promise<AdminCashDesk>;
  createCashDesk(payload: AdminCashDeskPayload): Promise<AdminCashDesk>;
  updateCashDesk(id: string, payload: AdminCashDeskPayload): Promise<AdminCashDesk>;
  deleteCashDesk(id: string): Promise<void>;
  getDevices(): Promise<AdminDevice[]>;
  getDeviceById(id: string): Promise<AdminDevice>;
  createDevice(payload: AdminDevicePayload): Promise<AdminDevice>;
  updateDevice(id: string, payload: AdminDevicePayload): Promise<AdminDevice>;
  deleteDevice(id: string): Promise<void>;
  getDistributionPoints(): Promise<AdminDistributionPoint[]>;
  getDistributionPointById(id: string): Promise<AdminDistributionPoint>;
  createDistributionPoint(payload: AdminDistributionPointPayload): Promise<AdminDistributionPoint>;
  updateDistributionPoint(id: string, payload: AdminDistributionPointPayload): Promise<AdminDistributionPoint>;
  deleteDistributionPoint(id: string): Promise<void>;
  getPrepStations(): Promise<AdminPrepStation[]>;
  getPrepStationById(id: string): Promise<AdminPrepStation>;
  createPrepStation(payload: AdminPrepStationPayload): Promise<AdminPrepStation>;
  updatePrepStation(id: string, payload: AdminPrepStationPayload): Promise<AdminPrepStation>;
  deletePrepStation(id: string): Promise<void>;
  getRestaurants(): Promise<AdminRestaurant[]>;
  getMyRestaurant(): Promise<AdminRestaurant>;
  getRestaurantById(id: string): Promise<AdminRestaurant>;
  createRestaurant(payload: AdminRestaurantPayload): Promise<AdminRestaurant>;
  updateRestaurant(id: string, payload: AdminRestaurantPayload): Promise<AdminRestaurant>;
  deleteRestaurant(id: string): Promise<void>;
  getHalls(): Promise<AdminHall[]>;
}
