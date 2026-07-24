import { apiClient } from 'shared/api/http/apiClient';

import type { ExpensesRepository } from '../../domain';

export const expensesRepository: ExpensesRepository = {
  getCategories: (params) => apiClient.getAdminExpenseCategories(params),
  createCategory: (payload) => apiClient.createAdminExpenseCategory(payload),
  updateCategory: (id, payload) => apiClient.updateAdminExpenseCategory(id, payload),
  getExpenses: (params) => apiClient.getAdminCashExpenses(params),
  voidExpense: (id, reason) => apiClient.voidAdminCashExpense(id, reason),
};
