import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CatalogCategoryPayload, CatalogItemPayload } from 'shared/api/admin-types';

import { catalogRepository } from '../data-access';

import { catalogKeys } from './keys';

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
