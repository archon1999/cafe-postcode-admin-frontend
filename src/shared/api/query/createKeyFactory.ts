import { normalizeFilters } from './normalizeFilters';

type QueryKeySegment = string;
type QueryKeyPrefix = readonly [QueryKeySegment, ...QueryKeySegment[]];
type QueryKeyFilters = Record<string, unknown>;
type SearchInput = string | QueryKeyFilters;

export interface QueryKeyFactory<TPrefix extends QueryKeyPrefix> {
  readonly all: TPrefix;

  params: (filters?: QueryKeyFilters) => TPrefix | readonly [...TPrefix, QueryKeyFilters];

  id: (id: string | number) => readonly [...TPrefix, string | number];

  lists: () => readonly [...TPrefix, 'list'];

  list: (filters?: QueryKeyFilters) => readonly [...TPrefix, 'list'] | readonly [...TPrefix, 'list', QueryKeyFilters];

  details: () => readonly [...TPrefix, 'detail'];

  detail: (id: string | number) => readonly [...TPrefix, 'detail', string | number];

  search: (query?: SearchInput) => readonly [...TPrefix, 'search'] | readonly [...TPrefix, 'search', SearchInput];

  infinite: (
    filters?: QueryKeyFilters,
  ) => readonly [...TPrefix, 'infinite'] | readonly [...TPrefix, 'infinite', QueryKeyFilters];
}

function withFilters<TPrefix extends QueryKeyPrefix, TSegment extends string>(
  prefix: TPrefix,
  segment: TSegment,
  filters?: QueryKeyFilters,
) {
  if (!filters || Object.keys(filters).length === 0) {
    return [...prefix, segment] as const;
  }

  const normalizedFilters = normalizeFilters(filters);

  if (Object.keys(normalizedFilters).length === 0) {
    return [...prefix, segment] as const;
  }

  return [...prefix, segment, normalizedFilters] as const;
}

function withParams<TPrefix extends QueryKeyPrefix>(prefix: TPrefix, filters?: QueryKeyFilters) {
  if (!filters || Object.keys(filters).length === 0) {
    return prefix;
  }

  const normalizedFilters = normalizeFilters(filters);

  if (Object.keys(normalizedFilters).length === 0) {
    return prefix;
  }

  return [...prefix, normalizedFilters] as const;
}

function withSearch<TPrefix extends QueryKeyPrefix>(prefix: TPrefix, query?: SearchInput) {
  if (query === undefined || query === null || query === '') {
    return [...prefix, 'search'] as const;
  }

  if (typeof query === 'string') {
    return [...prefix, 'search', query] as const;
  }

  const normalizedFilters = normalizeFilters(query);

  if (Object.keys(normalizedFilters).length === 0) {
    return [...prefix, 'search'] as const;
  }

  return [...prefix, 'search', normalizedFilters] as const;
}

export const createKeyFactory = <const TPrefix extends QueryKeyPrefix>(
  ...prefix: TPrefix
): QueryKeyFactory<TPrefix> => {
  return {
    all: prefix,

    params: (filters) => withParams(prefix, filters),

    id: (id) => [...prefix, id] as const,

    lists: () => [...prefix, 'list'] as const,

    list: (filters?) => withFilters(prefix, 'list', filters),

    details: () => [...prefix, 'detail'] as const,

    detail: (id) => [...prefix, 'detail', id] as const,

    search: (query) => withSearch(prefix, query),

    infinite: (filters?) => withFilters(prefix, 'infinite', filters),
  };
};

export type EntityFromFactory<T> = T extends QueryKeyFactory<infer TPrefix> ? TPrefix[0] : never;

export type QueryKeyFromFactory<T extends QueryKeyFactory<QueryKeyPrefix>> =
  | ReturnType<T['params']>
  | ReturnType<T['id']>
  | ReturnType<T['lists']>
  | ReturnType<T['list']>
  | ReturnType<T['details']>
  | ReturnType<T['detail']>
  | ReturnType<T['search']>
  | ReturnType<T['infinite']>;
