import type {
  AdminDiningTable,
  AdminDiningTablePayload,
  AdminHallConstructor,
  AdminHallConstructorPayload,
  AdminHall,
  AdminHallPayload,
  AdminTableSession,
  AdminTableSessionPayload,
  AdminUser,
  AdminZoneOrCabin,
  AdminZoneOrCabinPayload,
} from 'shared/api/admin-types';

export interface FloorRepository {
  getUsers(): Promise<AdminUser[]>;
  getHalls(): Promise<AdminHall[]>;
  getHallById(id: string): Promise<AdminHall>;
  getHallConstructor(id: string): Promise<AdminHallConstructor>;
  getZones(): Promise<AdminZoneOrCabin[]>;
  getZoneById(id: string): Promise<AdminZoneOrCabin>;
  createHall(payload: AdminHallPayload): Promise<AdminHall>;
  updateHall(id: string, payload: AdminHallPayload): Promise<AdminHall>;
  updateHallConstructor(id: string, payload: AdminHallConstructorPayload): Promise<AdminHallConstructor>;
  deleteHall(id: string): Promise<void>;
  createZone(payload: AdminZoneOrCabinPayload): Promise<AdminZoneOrCabin>;
  updateZone(id: string, payload: AdminZoneOrCabinPayload): Promise<AdminZoneOrCabin>;
  deleteZone(id: string): Promise<void>;
  getDiningTables(): Promise<AdminDiningTable[]>;
  getDiningTableById(id: string): Promise<AdminDiningTable>;
  createDiningTable(payload: AdminDiningTablePayload): Promise<AdminDiningTable>;
  updateDiningTable(id: string, payload: AdminDiningTablePayload): Promise<AdminDiningTable>;
  deleteDiningTable(id: string): Promise<void>;
  getTableSessions(): Promise<AdminTableSession[]>;
  getTableSessionById(id: string): Promise<AdminTableSession>;
  createTableSession(payload: AdminTableSessionPayload): Promise<AdminTableSession>;
  updateTableSession(id: string, payload: AdminTableSessionPayload): Promise<AdminTableSession>;
  deleteTableSession(id: string): Promise<void>;
}
