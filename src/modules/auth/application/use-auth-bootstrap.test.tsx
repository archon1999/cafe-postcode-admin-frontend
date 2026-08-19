/* @vitest-environment jsdom */

import { cleanup, render, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthBootstrap } from './use-auth-bootstrap';

const bootstrapAdminSessionMock = vi.fn();

vi.mock('./session-coordinator', () => ({
  bootstrapAdminSession: () => bootstrapAdminSessionMock(),
}));

function TestBootstrap() {
  useAuthBootstrap();
  return null;
}

beforeEach(() => {
  bootstrapAdminSessionMock.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('useAuthBootstrap', () => {
  it('always bootstraps from the HttpOnly refresh cookie when JS starts without a token', async () => {
    render(<TestBootstrap />);

    await waitFor(() => expect(bootstrapAdminSessionMock).toHaveBeenCalledTimes(1));
  });

  it('deduplicates bootstrap under React strict-mode remounts', async () => {
    render(
      <StrictMode>
        <TestBootstrap />
      </StrictMode>,
    );

    await waitFor(() => expect(bootstrapAdminSessionMock).toHaveBeenCalledTimes(1));
  });
});
