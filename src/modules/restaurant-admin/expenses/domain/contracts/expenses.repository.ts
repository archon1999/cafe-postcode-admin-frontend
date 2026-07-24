import type {
  AdminCashExpense,
  AdminCashExpensesQueryParams,
  AdminCashExpensesResponse,
  AdminExpenseCategory,
} from 'shared/api/admin-types';

export interface ExpensesRepository {
  getCategories(params?: { isActive?: boolean }): Promise<AdminExpenseCategory[]>;
  createCategory(payload: { name: string; sortOrder: number; isActive?: boolean }): Promise<AdminExpenseCategory>;
  updateCategory(
    id: string,
    payload: { name: string; sortOrder: number; isActive: boolean },
  ): Promise<AdminExpenseCategory>;
  getExpenses(params: AdminCashExpensesQueryParams): Promise<AdminCashExpensesResponse>;
  voidExpense(id: string, reason: string): Promise<AdminCashExpense>;
}
