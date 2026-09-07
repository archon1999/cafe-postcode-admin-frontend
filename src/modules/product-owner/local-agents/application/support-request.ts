import { useRef, useState } from 'react';

import type { SupportRequest } from '../domain';

function readStoredRequest(key: string): SupportRequest | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (
      !value ||
      typeof value !== 'object' ||
      !('requestId' in value) ||
      !('name' in value) ||
      !('parameters' in value)
    )
      return null;
    if (
      typeof value.requestId !== 'string' ||
      typeof value.name !== 'string' ||
      !value.parameters ||
      typeof value.parameters !== 'object'
    )
      return null;
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value.requestId) ||
      Array.isArray(value.parameters) ||
      Object.values(value.parameters).some((parameter) => typeof parameter !== 'string')
    )
      return null;
    return value as SupportRequest;
  } catch {
    return null;
  }
}

export function useAgentSupportRequest(agentId: string) {
  const key = `agent-support-request:${agentId}`;
  const [request, setRequest] = useState<SupportRequest | null>(() => readStoredRequest(key));
  const current = useRef(request);
  const prepare = (name: string, parameters: Record<string, string>) => {
    if (current.current) return current.current;
    const next = { requestId: crypto.randomUUID(), name, parameters: { ...parameters } };
    // Persist BEFORE the network call. Storage errors stop submission so reload
    // cannot accidentally assign a second ID to an uncertain physical action.
    localStorage.setItem(key, JSON.stringify(next));
    current.current = next;
    setRequest(next);
    return next;
  };
  const reset = () => {
    localStorage.removeItem(key);
    current.current = null;
    setRequest(null);
  };
  return { request, prepare, reset };
}
