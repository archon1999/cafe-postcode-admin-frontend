import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  CatalogCategoryPayload,
  CatalogItemGroupPayload,
  CatalogItemPayload,
  CatalogModifierGroupPayload,
  CatalogNameTranslationPayload,
} from 'shared/api/admin-types';

import { catalogRepository } from '../data-access';

import { catalogKeys } from './keys';

export function useTranslateCatalogNameMutation() {
  return useMutation({
    mutationFn: (payload: CatalogNameTranslationPayload) => catalogRepository.translateName(payload),
  });
}

export function useCreateCatalogCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CatalogCategoryPayload) => catalogRepository.createCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.categories() });
    },
  });
}

export function useUpdateCatalogCategoryMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CatalogCategoryPayload) => catalogRepository.updateCategory(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.categories() });
      await queryClient.invalidateQueries({ queryKey: catalogKeys.categoryDetail(id) });
    },
  });
}

export function useDeleteCatalogCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => catalogRepository.deleteCategory(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.categories() });
    },
  });
}

export function useReorderCatalogCategoriesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categories: Array<{ id: string; sortOrder: number }>) =>
      Promise.all(categories.map(({ id, sortOrder }) => catalogRepository.updateCategorySortOrder(id, sortOrder))),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.categories() });
    },
  });
}

export function useCreateCatalogItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CatalogItemPayload) => catalogRepository.createItem(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.items() });
    },
  });
}

export function useUpdateCatalogItemMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CatalogItemPayload) => catalogRepository.updateItem(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.items() });
      await queryClient.invalidateQueries({ queryKey: catalogKeys.itemDetail(id) });
    },
  });
}

export function useDeleteCatalogItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => catalogRepository.deleteItem(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.items() });
    },
  });
}

export function useReorderCatalogItemsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: Array<{ id: string; sortOrder: number }>) =>
      Promise.all(items.map(({ id, sortOrder }) => catalogRepository.updateItemSortOrder(id, sortOrder))),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.items() });
    },
  });
}

export function useCreateCatalogItemGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CatalogItemGroupPayload) => catalogRepository.createItemGroup(payload),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: catalogKeys.itemGroups() }),
  });
}

export function useUpdateCatalogItemGroupMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CatalogItemGroupPayload) => catalogRepository.updateItemGroup(id, payload),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: catalogKeys.itemGroups() }),
  });
}

export function useSaveCatalogItemGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CatalogItemGroupPayload }) =>
      catalogRepository.updateItemGroup(id, payload),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: catalogKeys.itemGroups() }),
  });
}

export function useDeleteCatalogItemGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogRepository.deleteItemGroup(id),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: catalogKeys.itemGroups() }),
  });
}

export function useCreateCatalogModifierGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CatalogModifierGroupPayload) => catalogRepository.createModifierGroup(payload),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: catalogKeys.modifierGroups() }),
  });
}

export function useUpdateCatalogModifierGroupMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CatalogModifierGroupPayload) => catalogRepository.updateModifierGroup(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: catalogKeys.modifierGroups() });
      await queryClient.invalidateQueries({ queryKey: catalogKeys.modifierGroupDetail(id) });
    },
  });
}

export function useDeleteCatalogModifierGroupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogRepository.deleteModifierGroup(id),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: catalogKeys.modifierGroups() }),
  });
}
