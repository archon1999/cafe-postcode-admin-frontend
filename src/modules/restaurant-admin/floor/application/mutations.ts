import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  AdminDiningTablePayload,
  AdminHallConstructorPayload,
  AdminHallPayload,
  AdminTableSessionPayload,
  AdminZoneOrCabinPayload,
} from 'shared/api/admin-types';

import { floorRepository } from '../data-access';

import { floorKeys } from './keys';

function invalidateQueryKeys(queryClient: ReturnType<typeof useQueryClient>, keys: ReadonlyArray<readonly unknown[]>) {
  return Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

export function useCreateHallMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminHallPayload) => floorRepository.createHall(payload),
    onSuccess: async () => invalidateQueryKeys(queryClient, [floorKeys.halls()]),
  });
}

export function useUpdateHallMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminHallPayload) => floorRepository.updateHall(id, payload),
    onSuccess: async () => invalidateQueryKeys(queryClient, [floorKeys.halls(), floorKeys.hallDetail(id)]),
  });
}

export function useUpdateHallConstructorMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminHallConstructorPayload) => floorRepository.updateHallConstructor(id, payload),
    onSuccess: async () =>
      invalidateQueryKeys(queryClient, [
        floorKeys.halls(),
        floorKeys.hallDetail(id),
        floorKeys.hallConstructor(id),
        floorKeys.diningTables(),
      ]),
  });
}

export function useDeleteHallMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => floorRepository.deleteHall(id),
    onSuccess: async () => invalidateQueryKeys(queryClient, [floorKeys.halls()]),
  });
}

export function useCreateZoneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminZoneOrCabinPayload) => floorRepository.createZone(payload),
    onSuccess: async () => invalidateQueryKeys(queryClient, [floorKeys.zones(), floorKeys.halls()]),
  });
}

export function useUpdateZoneMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminZoneOrCabinPayload) => floorRepository.updateZone(id, payload),
    onSuccess: async () =>
      invalidateQueryKeys(queryClient, [floorKeys.zones(), floorKeys.zoneDetail(id), floorKeys.halls()]),
  });
}

export function useDeleteZoneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => floorRepository.deleteZone(id),
    onSuccess: async () => invalidateQueryKeys(queryClient, [floorKeys.zones(), floorKeys.halls()]),
  });
}

export function useCreateDiningTableMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminDiningTablePayload) => floorRepository.createDiningTable(payload),
    onSuccess: async () => invalidateQueryKeys(queryClient, [floorKeys.diningTables()]),
  });
}

export function useUpdateDiningTableMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminDiningTablePayload) => floorRepository.updateDiningTable(id, payload),
    onSuccess: async () =>
      invalidateQueryKeys(queryClient, [floorKeys.diningTables(), floorKeys.diningTableDetail(id)]),
  });
}

export function useDeleteDiningTableMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => floorRepository.deleteDiningTable(id),
    onSuccess: async () => invalidateQueryKeys(queryClient, [floorKeys.diningTables()]),
  });
}

export function useCreateTableSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminTableSessionPayload) => floorRepository.createTableSession(payload),
    onSuccess: async () => invalidateQueryKeys(queryClient, [floorKeys.tableSessions()]),
  });
}

export function useUpdateTableSessionMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminTableSessionPayload) => floorRepository.updateTableSession(id, payload),
    onSuccess: async () =>
      invalidateQueryKeys(queryClient, [floorKeys.tableSessions(), floorKeys.tableSessionDetail(id)]),
  });
}

export function useDeleteTableSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => floorRepository.deleteTableSession(id),
    onSuccess: async () => invalidateQueryKeys(queryClient, [floorKeys.tableSessions()]),
  });
}
