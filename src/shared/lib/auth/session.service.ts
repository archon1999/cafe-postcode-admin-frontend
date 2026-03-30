import { StorageService } from '../storage';

import { AUTH_STORAGE_KEYS } from './keys';

export const sessionService = {
  setAccessToken(token: string): void {
    StorageService.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, token);
  },

  getAccessToken(): string | null {
    return StorageService.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  },

  removeAccessToken(): void {
    StorageService.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  },

  hasAccessToken(): boolean {
    return StorageService.hasItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  },

  clearSession(): void {
    this.removeAccessToken();
  },

  isSessionActive(): boolean {
    return this.hasAccessToken();
  },
};
