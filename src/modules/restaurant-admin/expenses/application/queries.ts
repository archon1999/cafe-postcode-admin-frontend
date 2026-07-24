import { useQuery } from '@tanstack/react-query';
import type { AdminCashExpensesQueryParams } from 'shared/api/admin-types';

import { expensesRepository } from '../data-access';
import { expensesKeys } from './keys';

export function useExpenseCategoriesQuery() {
  return useQuery({ queryKey: expensesKeys.categories, queryFn: () => expensesRepository.getCategories() });
}

export function useCashExpensesQuery(params: AdminCashExpensesQueryParams) {
  return useQuery({ queryKey: expensesKeys.list(params), queryFn: () => expensesRepository.getExpenses(params) });
}
