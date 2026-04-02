import { createKeyFactory } from 'shared/api';

const floorBaseKeys = createKeyFactory('floor');
const floorUsersKeys = createKeyFactory('floor', 'users');
const hallsKeys = createKeyFactory('floor', 'halls');
const hallKeys = createKeyFactory('floor', 'hall');
const zonesKeys = createKeyFactory('floor', 'zones');
const zoneKeys = createKeyFactory('floor', 'zone');
const diningTablesKeys = createKeyFactory('floor', 'diningTables');
const diningTableKeys = createKeyFactory('floor', 'diningTable');
const tableSessionsKeys = createKeyFactory('floor', 'tableSessions');
const tableSessionKeys = createKeyFactory('floor', 'tableSession');

export const floorKeys = {
  all: floorBaseKeys.all,
  users: () => floorUsersKeys.all,
  halls: () => hallsKeys.all,
  hallsList: hallsKeys.list,
  hallDetail: hallKeys.id,
  hallConstructor: (id: string) => [...floorKeys.hallDetail(id), 'constructor'] as const,
  zones: () => zonesKeys.all,
  zonesList: zonesKeys.list,
  zoneDetail: zoneKeys.id,
  diningTables: () => diningTablesKeys.all,
  diningTablesList: diningTablesKeys.list,
  diningTableDetail: diningTableKeys.id,
  tableSessions: () => tableSessionsKeys.all,
  tableSessionsList: tableSessionsKeys.list,
  tableSessionDetail: tableSessionKeys.id,
} as const;
