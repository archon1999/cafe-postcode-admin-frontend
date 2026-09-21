// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { FeePolicy, FeePreview } from '../domain';

import { useFeeEditor } from './use-fee-editor';

const actions = vi.hoisted(() => ({
  preview: { mutateAsync: vi.fn(), isPending: false },
  save: { mutateAsync: vi.fn(), isPending: false },
}));
vi.mock('./mutations', () => ({ useFeeMutations: () => actions }));

const policy: FeePolicy = {
  id: 'p1',
  name: 'Technical tariff',
  revision: 'r1',
  isActive: true,
  definition: {
    name: 'Technical tariff',
    timezone: 'Asia/Tashkent',
    source: 'let day = minutes_in("09:00", "18:00");\nreturn day / 60 * dayRate + day_rate;',
    parameters: { dayRate: '60000', day_rate: '120000' },
  },
};
const preview: FeePreview = {
  definition: policy.definition,
  amount: 150000,
  exact: '150000',
  durationMinutes: '60',
  timeDependent: true,
  bindings: [{ name: 'day', value: '30' }],
};

describe('technical fee editor', () => {
  beforeEach(() => vi.clearAllMocks());

  it('preserves technical source and case-sensitive identifiers without AI', () => {
    const { result } = renderHook(() => useFeeEditor(policy, 'Asia/Tashkent', vi.fn()));
    expect(result.current.source).toBe(policy.definition.source);
    expect(result.current.parameters).toEqual([
      ['dayRate', '60000'],
      ['day_rate', '120000'],
    ]);
  });

  it('does not accept a stale preview after source changes during the request', async () => {
    let resolve!: (value: FeePreview) => void;
    actions.preview.mutateAsync.mockImplementation(
      () =>
        new Promise<FeePreview>((done) => {
          resolve = done;
        }),
    );
    const { result } = renderHook(() => useFeeEditor(policy, 'Asia/Tashkent', vi.fn()));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.preview();
    });
    act(() => result.current.setSource('subtotal * 0.2'));
    await act(async () => {
      resolve(preview);
      await pending;
    });
    expect(result.current.verified).toBeUndefined();
    await act(async () => result.current.save());
    expect(actions.save.mutateAsync).not.toHaveBeenCalled();
  });

  it('invalidates a successful preview when parameters or context change', async () => {
    actions.preview.mutateAsync.mockResolvedValue(preview);
    const { result } = renderHook(() => useFeeEditor(policy, 'Asia/Tashkent', vi.fn()));
    await act(async () => result.current.preview());
    expect(result.current.verified?.amount).toBe(150000);
    act(() =>
      result.current.setParameters([
        ['dayRate', '70000'],
        ['day_rate', '120000'],
      ]),
    );
    expect(result.current.verified).toBeUndefined();
    await act(async () => result.current.preview());
    act(() => result.current.setContext({ ...result.current.context, subtotal: 900000 }));
    expect(result.current.verified).toBeUndefined();
  });

  it('rejects duplicate parameters instead of silently overwriting their values', async () => {
    const { result } = renderHook(() => useFeeEditor(policy, 'Asia/Tashkent', vi.fn()));
    act(() =>
      result.current.setParameters([
        ['rate', '10'],
        ['rate', '20'],
      ]),
    );
    await act(async () => result.current.preview());
    expect(actions.preview.mutateAsync).not.toHaveBeenCalled();
    expect(result.current.error?.message).toMatch(/Duplicate/);
  });

  it('uses the opened revision even if a background refresh sees another author’s update', async () => {
    actions.preview.mutateAsync.mockResolvedValue(preview);
    actions.save.mutateAsync.mockResolvedValue(policy);
    const { result, rerender } = renderHook(({ current }) => useFeeEditor(current, 'Asia/Tashkent', vi.fn()), {
      initialProps: { current: policy },
    });
    rerender({ current: { ...policy, revision: 'r2' } });
    await act(async () => result.current.preview());
    await act(async () => result.current.save());
    expect(actions.save.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ expectedRevision: 'r1' }));
  });
});
