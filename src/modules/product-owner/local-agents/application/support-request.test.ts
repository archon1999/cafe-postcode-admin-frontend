/* @vitest-environment jsdom */

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useAgentSupportRequest } from './support-request';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('Agent command identity', () => {
  it('reuses one durable request for rapid clicks and after reload', () => {
    const { result, unmount } = renderHook(() => useAgentSupportRequest('agent-one'));
    let id = '';
    act(() => {
      const first = result.current.prepare('fiscal.z.close', { sessionId: 'original-session' });
      const second = result.current.prepare('fiscal.z.close', { sessionId: 'different-session' });
      id = first.requestId;
      expect(second).toBe(first);
      expect(JSON.parse(localStorage.getItem('agent-support-request:agent-one') ?? '{}').requestId).toBe(id);
    });
    unmount();
    const restored = renderHook(() => useAgentSupportRequest('agent-one'));
    expect(restored.result.current.request?.requestId).toBe(id);
    expect(restored.result.current.request?.parameters.sessionId).toBe('original-session');
    const another = renderHook(() => useAgentSupportRequest('agent-two'));
    expect(another.result.current.request).toBeNull();
  });

  it('does not create an executable request when durable browser storage fails', () => {
    const { result } = renderHook(() => useAgentSupportRequest('agent-one'));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('disk full');
    });
    expect(() => result.current.prepare('printer.test', { integrationId: 'printer' })).toThrow('disk full');
    expect(result.current.request).toBeNull();
  });

  it('allocates a new identity only after explicit reset', () => {
    const { result } = renderHook(() => useAgentSupportRequest('agent-one'));
    let first = '';
    act(() => {
      first = result.current.prepare('runtime.inspect', {}).requestId;
    });
    act(() => {
      result.current.reset();
    });
    expect(localStorage.getItem('agent-support-request:agent-one')).toBeNull();
    act(() => {
      expect(result.current.prepare('runtime.inspect', {}).requestId).not.toBe(first);
    });
  });
});
