import { AUTH_STORAGE_KEYS } from './keys';

let accessToken: string | null = null;
let accessExpiresAt: string | null = null;

function purgeLegacyTokenStorage(): void {
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
}

if (typeof window !== 'undefined') {
  purgeLegacyTokenStorage();
}

export const sessionService = {
  setAccessToken(token: string, expiresAt?: string): void {
    accessToken = token;
    accessExpiresAt = expiresAt ?? null;
    purgeLegacyTokenStorage();
  },

  getAccessToken(): string | null {
    return accessToken;
  },

  getAccessExpiresAt(): string | null {
    return accessExpiresAt;
  },

  removeAccessToken(): void {
    accessToken = null;
    accessExpiresAt = null;
    purgeLegacyTokenStorage();
  },

  hasAccessToken(): boolean {
    return this.getAccessToken() !== null;
  },

  clearSession(): void {
    this.removeAccessToken();
  },

  isSessionActive(): boolean {
    return this.hasAccessToken();
  },
};
