import { normalizeFilters } from './normalizeFilters';

export interface QueryKeyFactory<TEntity extends string> {
  readonly all: readonly [TEntity];

  lists: () => readonly [TEntity, 'list'];

  list: (filters?: Record<string, unknown>) => readonly [TEntity, 'list', Record<string, unknown>?];

  details: () => readonly [TEntity, 'detail'];

  detail: (id: string | number) => readonly [TEntity, 'detail', string | number];

  search: (query: string) => readonly [TEntity, 'search', string];

  infinite: (filters?: Record<string, unknown>) => readonly [TEntity, 'infinite', Record<string, unknown>?];
}

export const createKeyFactory = <TEntity extends string>(entity: TEntity): QueryKeyFactory<TEntity> => {
  return {
    all: [entity] as const,

    lists: () => [entity, 'list'] as const,

    list: (filters?) => {
      if (!filters || Object.keys(filters).length === 0) {
        return [entity, 'list'] as const;
      }
      return [entity, 'list', normalizeFilters(filters)] as const;
    },

    details: () => [entity, 'detail'] as const,

    detail: (id) => [entity, 'detail', id] as const,

    search: (query) => [entity, 'search', query] as const,

    infinite: (filters?) => {
      if (!filters || Object.keys(filters).length === 0) {
        return [entity, 'infinite'] as const;
      }
      return [entity, 'infinite', normalizeFilters(filters)] as const;
    },
  };
};

export type EntityFromFactory<T> = T extends QueryKeyFactory<infer E> ? E : never;

export type QueryKeyFromFactory<T extends QueryKeyFactory<any>> =
  | ReturnType<T['lists']>
  | ReturnType<T['list']>
  | ReturnType<T['details']>
  | ReturnType<T['detail']>
  | ReturnType<T['search']>
  | ReturnType<T['infinite']>;
