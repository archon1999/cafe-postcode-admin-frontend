// @vitest-environment jsdom

import { QueryObserver } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AdminSessionUser } from 'shared/api/admin-types';
import { queryClient } from 'shared/api/query/query.config';
import { sessionService } from 'shared/lib/auth/session.service';

import type { AdminCredentialResponse } from '../domain/entities/admin-auth.types';
import { getLastAdminActivityAt, resetAdminActivityClock } from '../domain/services/admin-activity.service';
import { authStore } from '../domain/stores/authentication.store';
import { currentUserStore } from '../domain/stores/current-user.store';

import { bootstrapAdminSession, refreshAdminSession } from './session-coordinator';

const { refreshRequestMock, getAdminAuthErrorCodeMock } = vi.hoisted(() => ({
  refreshRequestMock: vi.fn(),
  getAdminAuthErrorCodeMock: vi.fn((error: { code?: string }) => error.code),
}));

vi.mock('../data-access/api/auth.api', () => ({
  refreshRequest: refreshRequestMock,
  getAdminAuthErrorCode: getAdminAuthErrorCodeMock,
}));

class FakeBroadcastChannel {
  static messages: unknown[] = [];
  addEventListener = vi.fn();
  postMessage(message: unknown) {
    FakeBroadcastChannel.messages.push(message);
  }
}

function credentials(token = 'access-1'): AdminCredentialResponse {
  return {
    status: 'authenticated',
    accessToken: token,
    accessExpiresAt: '2026-08-16T20:15:00Z',
    refreshExpiresAt: '2026-09-15T20:00:00Z',
    user: {
      id: 'user-1',
      username: 'admin',
      fullName: 'Admin',
      isActive: true,
      isSuperuser: true,
      permissionCodes: [],
      role: null,
    } as unknown as AdminSessionUser,
    session: {
      id: 'session-1',
      status: 'active',
      surface: 'admin',
      expiresAt: '2026-08-16T20:15:00Z',
      createdAt: '2026-08-16T20:00:00Z',
      lockedAt: null,
      mfaVerifiedAt: '2026-08-16T20:00:00Z',
      refreshFamilyId: 'family-1',
    },
  };
}

beforeEach(() => {
  refreshRequestMock.mockReset();
  getAdminAuthErrorCodeMock.mockClear();
  FakeBroadcastChannel.messages = [];
  Object.defineProperty(window, 'BroadcastChannel', {
    configurable: true,
    value: FakeBroadcastChannel,
  });
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: { request: vi.fn((_name, _options, callback) => callback()) },
  });
  authStore.getState().logout();
  currentUserStore.getState().clearCurrentUser();
  queryClient.clear();
  sessionService.clearSession();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('admin refresh coordination', () => {
  it('keeps the mounted list observing results when a pending request refreshes its token', async () => {
    currentUserStore.getState().setCurrentUser(credentials().user);
    refreshRequestMock.mockResolvedValue(credentials('rotated-list-access'));
    let calls = 0;
    const observer = new QueryObserver(queryClient, {
      queryKey: ['refresh-observed-agent-list'],
      retry: false,
      queryFn: async () => {
        if (++calls === 1) await refreshAdminSession();
        return ['online-agent'];
      },
    });
    const observed = vi.fn();
    const unsubscribe = observer.subscribe(observed);
    try {
      await vi.waitFor(() => {
        expect(observer.getCurrentResult().status).toBe('success');
        expect(observer.getCurrentResult().data).toEqual(['online-agent']);
        expect(queryClient.getQueryData(['refresh-observed-agent-list'])).toEqual(['online-agent']);
      });
      expect(refreshRequestMock).toHaveBeenCalledTimes(1);
    } finally {
      unsubscribe();
      observer.destroy();
    }
  });

  it('uses one Web Lock guarded refresh for concurrent callers and keeps the token in memory', async () => {
    let resolveRefresh!: (value: AdminCredentialResponse) => void;
    refreshRequestMock.mockReturnValue(
      new Promise<AdminCredentialResponse>((resolve) => {
        resolveRefresh = resolve;
      }),
    );

    const first = refreshAdminSession();
    const second = refreshAdminSession();
    resolveRefresh(credentials());
    await Promise.all([first, second]);

    expect(refreshRequestMock).toHaveBeenCalledTimes(1);
    expect(navigator.locks.request).toHaveBeenCalledTimes(1);
    expect(sessionService.getAccessToken()).toBe('access-1');
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
    expect(FakeBroadcastChannel.messages).toContainEqual(expect.objectContaining({ type: 'credentials' }));
  });

  it('does not treat token rotation as user activity locally or in another tab', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-16T20:00:00Z'));
    resetAdminActivityClock();
    const actualActivityAt = getLastAdminActivityAt();
    vi.advanceTimersByTime(15 * 60 * 1000);
    refreshRequestMock.mockResolvedValue(credentials('rotated-access'));

    await refreshAdminSession();

    expect(getLastAdminActivityAt()).toBe(actualActivityAt);
    expect(FakeBroadcastChannel.messages).toContainEqual(
      expect.objectContaining({ type: 'credentials', resetActivity: false }),
    );
  });

  it('retries against the successor cookie after a server refresh_race grace response', async () => {
    vi.useFakeTimers();
    refreshRequestMock.mockRejectedValueOnce({ code: 'refresh_race' }).mockResolvedValueOnce(credentials('access-2'));

    const resultPromise = refreshAdminSession();
    await vi.advanceTimersByTimeAsync(1100);
    const result = await resultPromise;

    expect(result.accessToken).toBe('access-2');
    expect(refreshRequestMock).toHaveBeenCalledTimes(2);
    expect(authStore.getState().status).toBe('authenticated');
  });

  it('turns an idle refresh rejection into the full locked state instead of logging out', async () => {
    refreshRequestMock.mockRejectedValue({ code: 'session_locked' });

    await bootstrapAdminSession();

    expect(authStore.getState().status).toBe('locked');
    expect(authStore.getState().isAuthenticated).toBe(true);
  });
});
