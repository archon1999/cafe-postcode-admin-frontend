interface GetEstimatedTotalCountParams {
  totalItemsCount?: number | null;
  totalPages?: number | null;
  pageSize: number;
  isLoading?: boolean;
}

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export const normalizeTotalItemsCount = (totalItemsCount?: number | null): number | undefined =>
  isFiniteNumber(totalItemsCount) ? totalItemsCount : undefined;

export const getEstimatedTotalCount = ({
  totalItemsCount,
  totalPages,
  pageSize,
  isLoading,
}: GetEstimatedTotalCountParams): number => {
  const normalizedTotalItemsCount = normalizeTotalItemsCount(totalItemsCount);

  if (typeof normalizedTotalItemsCount === 'number') {
    return normalizedTotalItemsCount;
  }

  const safeTotalPages = isFiniteNumber(totalPages) ? totalPages : 0;

  if (isLoading && safeTotalPages === 0) {
    return -1;
  }

  if (safeTotalPages === 0) {
    return 0;
  }

  return pageSize * safeTotalPages;
};
