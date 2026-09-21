export const feeKeys = {
  all: (scope: string | null | undefined) => ['service-fees', scope] as const,
  catalog: (scope: string | null | undefined) => [...feeKeys.all(scope), 'catalog'] as const,
  policies: (scope: string | null | undefined) => [...feeKeys.all(scope), 'policies'] as const,
  assignments: (scope: string | null | undefined) => [...feeKeys.all(scope), 'assignments'] as const,
};
