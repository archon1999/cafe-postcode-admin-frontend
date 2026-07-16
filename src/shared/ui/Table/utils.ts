export function rowInPage<T>(data: T[], page: number, rowsPerPage: number) {
  return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
}

export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page ? Math.max(0, page * rowsPerPage - arrayLength) : 0;
}

type Comparable = number | string;

function getNestedProperty(obj: unknown, key: string): Comparable {
  const value = key.split('.').reduce<unknown>((current, part) => {
    if (typeof current !== 'object' || current === null) return undefined;
    return (current as Record<string, unknown>)[part];
  }, obj);

  return typeof value === 'number' || typeof value === 'string' ? value : '';
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const aValue = getNestedProperty(a, String(orderBy));
  const bValue = getNestedProperty(b, String(orderBy));

  if (bValue < aValue) {
    return -1;
  }

  if (bValue > aValue) {
    return 1;
  }

  return 0;
}

export function getComparator<Key extends PropertyKey>(
  order: 'asc' | 'desc',
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
