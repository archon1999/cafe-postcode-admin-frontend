/* @vitest-environment jsdom */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { printingRepository } from '../data-access';

import { printingKeys } from './keys';
import { useCreatePrintTemplateVersionMutation, usePublishPrintTemplateVersionMutation } from './mutations';

vi.mock('../data-access', () => ({
  printingRepository: {
    createVersion: vi.fn(),
    publishVersion: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function queryWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('printing configuration mutation invalidation', () => {
  it('invalidates the template query after a draft version is created', async () => {
    vi.spyOn(printingRepository, 'createVersion').mockResolvedValue({} as never);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCreatePrintTemplateVersionMutation(), {
      wrapper: queryWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ templateId: 'template-1', payload: { presetKey: 'legacy_80' } });
    });

    expect(printingRepository.createVersion).toHaveBeenCalledWith('template-1', { presetKey: 'legacy_80' });
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: printingKeys.templates() });
  });

  it('invalidates the same template query after a version is published', async () => {
    vi.spyOn(printingRepository, 'publishVersion').mockResolvedValue({} as never);
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => usePublishPrintTemplateVersionMutation(), {
      wrapper: queryWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ templateId: 'template-1', versionId: 'version-2' });
    });

    expect(printingRepository.publishVersion).toHaveBeenCalledWith('template-1', 'version-2');
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: printingKeys.templates() });
  });
});
