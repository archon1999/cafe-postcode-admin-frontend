export const reportsKeys = {
  all: ['reports'] as const,
  summary: (params: Record<string, unknown>) => [...reportsKeys.all, 'summary', params] as const,
  sales: (params: Record<string, unknown>) => [...reportsKeys.all, 'sales', params] as const,
  openChecks: (params: Record<string, unknown>) => [...reportsKeys.all, 'openChecks', params] as const,
  topItems: (params: Record<string, unknown>) => [...reportsKeys.all, 'topItems', params] as const,
  topStaff: (params: Record<string, unknown>) => [...reportsKeys.all, 'topStaff', params] as const,
  paymentBreakdown: (params: Record<string, unknown>) => [...reportsKeys.all, 'paymentBreakdown', params] as const,
  shifts: (params: Record<string, unknown>) => [...reportsKeys.all, 'shifts', params] as const,
} as const;
