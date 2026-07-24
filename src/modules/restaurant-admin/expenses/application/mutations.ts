import { useMutation, useQueryClient } from '@tanstack/react-query';

import { expensesRepository } from '../data-access';

import { expensesKeys } from './keys';

export function useCreateExpenseCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; sortOrder: number; isActive?: boolean }) =>
      expensesRepository.createCategory(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expensesKeys.categories }),
  });
}

export function useUpdateExpenseCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name: string; sortOrder: number; isActive: boolean } }) =>
      expensesRepository.updateCategory(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expensesKeys.categories }),
  });
}

export function useReorderExpenseCategoriesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categories: Array<{ id: string; name: string; sortOrder: number; isActive: boolean }>) =>
      Promise.all(categories.map(({ id, ...payload }) => expensesRepository.updateCategory(id, payload))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expensesKeys.categories }),
  });
}

export function useVoidExpenseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => expensesRepository.voidExpense(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: expensesKeys.all }),
  });
}
