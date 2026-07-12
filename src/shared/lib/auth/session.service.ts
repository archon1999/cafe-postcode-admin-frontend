import { AUTH_STORAGE_KEYS } from './keys';

export const sessionService = {
  setAccessToken(token: string): void {
    sessionStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, JSON.stringify(token));
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  },

  getAccessToken(): string | null {
    const value = sessionStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    return value ? (JSON.parse(value) as string) : null;
  },

  removeAccessToken(): void {
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  },

  hasAccessToken(): boolean {
    return sessionStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN) !== null;
  },

  clearSession(): void {
    this.removeAccessToken();
  },

  isSessionActive(): boolean {
    return this.hasAccessToken();
  },
};
