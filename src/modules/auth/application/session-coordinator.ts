import { getAdminAuthErrorCode, refreshRequest } from '../data-access/api/auth.api';
import type { AdminCredentialResponse } from '../domain/entities/admin-auth.types';
import { resetAdminActivityClock } from '../domain/services/admin-activity.service';
import { adminScopeStore } from '../domain/stores/admin-scope.store';
import { authStore } from '../domain/stores/authentication.store';
import { currentUserStore } from '../domain/stores/current-user.store';

const AUTH_CHANNEL_NAME = 'cafe-admin-auth-v1';
const REFRESH_LOCK_NAME = 'cafe-admin-refresh-v1';

type AuthChannelMessage =
  | { type: 'credentials'; credentials: AdminCredentialResponse; resetActivity: boolean }
  | { type: 'locked'; lockedAt: string }
  | { type: 'logout' };

let channel: BroadcastChannel | null = null;
let refreshPromise: Promise<AdminCredentialResponse> | null = null;
let latestCredentials: AdminCredentialResponse | null = null;
let credentialRevision = 0;

function clearQueryCache(): void {
  void import('shared/api/query/query.config').then(({ queryClient }) => queryClient.clear());
}

function clearLocalAuthentication(): void {
  authStore.getState().logout();
  currentUserStore.getState().clearCurrentUser();
  adminScopeStore.getState().clearScope();
  latestCredentials = null;
  clearQueryCache();
}

function receiveMessage(message: AuthChannelMessage): void {
  if (message.type === 'credentials') {
    applyAdminCredentials(message.credentials, {
      broadcast: false,
      resetActivity: message.resetActivity,
    });
    return;
  }
  if (message.type === 'locked') {
    markAdminSessionLocked(message.lockedAt, false);
    return;
  }
  clearAdminAuthentication({ broadcast: false });
}

function getChannel(): BroadcastChannel | null {
  if (channel || typeof window === 'undefined' || typeof window.BroadcastChannel === 'undefined') {
    return channel;
  }
  channel = new window.BroadcastChannel(AUTH_CHANNEL_NAME);
  channel.addEventListener('message', (event: MessageEvent<AuthChannelMessage>) => receiveMessage(event.data));
  return channel;
}

function postMessage(message: AuthChannelMessage): void {
  getChannel()?.postMessage(message);
}

export function startAdminAuthCoordination(): () => void {
  getChannel();
  return () => undefined;
}

export function applyAdminCredentials(
  credentials: AdminCredentialResponse,
  options: { broadcast?: boolean; resetActivity?: boolean } = {},
): void {
  latestCredentials = credentials;
  credentialRevision += 1;
  authStore.getState().setCredentials(credentials);
  const resetActivity = options.resetActivity !== false;
  if (resetActivity) {
    resetAdminActivityClock();
  }
  currentUserStore.getState().setCurrentUser(credentials.user);
  if (!credentials.user.isSuperuser) {
    adminScopeStore.getState().clearScope();
  }
  clearQueryCache();
  if (options.broadcast !== false) {
    postMessage({ type: 'credentials', credentials, resetActivity });
  }
}

export function markAdminSessionLocked(lockedAt = new Date().toISOString(), broadcast = true): void {
  authStore.getState().markLocked(lockedAt);
  if (broadcast) {
    postMessage({ type: 'locked', lockedAt });
  }
}

export function clearAdminAuthentication(options: { broadcast?: boolean } = {}): void {
  clearLocalAuthentication();
  if (options.broadcast !== false) {
    postMessage({ type: 'logout' });
  }
}

function waitForCredentialsAfter(revision: number, timeoutMs: number): Promise<AdminCredentialResponse | null> {
  if (credentialRevision > revision && latestCredentials) {
    return Promise.resolve(latestCredentials);
  }
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      if (credentialRevision > revision && latestCredentials) {
        window.clearInterval(interval);
        resolve(latestCredentials);
      } else if (Date.now() - startedAt >= timeoutMs) {
        window.clearInterval(interval);
        resolve(null);
      }
    }, 25);
  });
}

async function performRefresh(startRevision: number): Promise<AdminCredentialResponse> {
  if (credentialRevision > startRevision && latestCredentials) {
    return latestCredentials;
  }
  try {
    const credentials = await refreshRequest();
    applyAdminCredentials(credentials, { resetActivity: false });
    return credentials;
  } catch (error) {
    if (getAdminAuthErrorCode(error) !== 'refresh_race') {
      throw error;
    }
    const broadcastCredentials = await waitForCredentialsAfter(startRevision, 1000);
    if (broadcastCredentials) {
      return broadcastCredentials;
    }
    const credentials = await refreshRequest();
    applyAdminCredentials(credentials, { resetActivity: false });
    return credentials;
  }
}

export function refreshAdminSession(): Promise<AdminCredentialResponse> {
  if (refreshPromise) {
    return refreshPromise;
  }
  const startRevision = credentialRevision;
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  refreshPromise = (
    locks
      ? locks.request(REFRESH_LOCK_NAME, { mode: 'exclusive' }, () => performRefresh(startRevision))
      : performRefresh(startRevision)
  ).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export async function bootstrapAdminSession(): Promise<void> {
  startAdminAuthCoordination();
  try {
    await refreshAdminSession();
  } catch (error) {
    if (getAdminAuthErrorCode(error) === 'session_locked') {
      markAdminSessionLocked(undefined, false);
      return;
    }
    clearAdminAuthentication({ broadcast: false });
  } finally {
    authStore.getState().setBootstrapping(false);
  }
}
