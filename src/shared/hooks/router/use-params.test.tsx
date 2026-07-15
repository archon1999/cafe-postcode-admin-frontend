/* @vitest-environment jsdom */

import { cleanup, renderHook } from '@testing-library/react';
import { useParams as useReactRouterParams } from 'react-router';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import { useParams } from './use-params';

vi.mock('react-router', () => ({
  useParams: vi.fn(),
}));

const mockedUseReactRouterParams = vi.mocked(useReactRouterParams);

describe('useParams', () => {
  afterEach(cleanup);

  beforeEach(() => {
    mockedUseReactRouterParams.mockReset();
  });

  it('returns the upstream params object and follows its identity', () => {
    const firstParams = { id: 'order-1' };
    const secondParams = { id: 'order-2' };
    mockedUseReactRouterParams.mockReturnValue(firstParams);

    const { result, rerender } = renderHook(() => useParams());

    expect(result.current).toBe(firstParams);

    rerender();
    expect(result.current).toBe(firstParams);

    mockedUseReactRouterParams.mockReturnValue(secondParams);
    rerender();

    expect(result.current).toBe(secondParams);
  });

  it('preserves the typed route-parameter contract', () => {
    mockedUseReactRouterParams.mockReturnValue({ id: 'typed-order' });

    const { result } = renderHook(() => useParams<{ id: string }>());

    expectTypeOf(result.current.id).toEqualTypeOf<string | undefined>();
    expect(result.current.id).toBe('typed-order');
  });
});
