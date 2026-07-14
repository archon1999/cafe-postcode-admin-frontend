import { AUTH_STORAGE_KEYS } from './keys';

export const sessionService = {
  setAccessToken(token: string): void {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, JSON.stringify(token));
    sessionStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  },

  getAccessToken(): string | null {
    const localValue = localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    const sessionValue = sessionStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    const value = localValue ?? sessionValue;

    if (!localValue && sessionValue) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, sessionValue);
      sessionStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    }

    return value ? (JSON.parse(value) as string) : null;
  },

  removeAccessToken(): void {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
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
