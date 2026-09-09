import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import {
  clearAdminAuthentication,
  markAdminSessionLocked,
  refreshAdminSession,
} from 'modules/auth/application/session-coordinator';
import { getAdminAuthErrorStatus } from 'modules/auth/data-access/api/auth.api';
import { adminScopeStore, currentUserStore } from 'modules/auth/domain';
import { consumeAdminActivitySignal } from 'modules/auth/domain/services/admin-activity.service';
import { authStore } from 'modules/auth/domain/stores/authentication.store';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

function getApiLanguage() {
  const selectedLanguage = window.localStorage.getItem('i18nextLng') ?? 'uz';

  if (selectedLanguage === 'uz-Cyrl') {
    return 'uz-crl';
  }

  return selectedLanguage;
}

export const instance: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
});

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStore.getState().getAccessToken();
    const language = getApiLanguage();
    const currentUser = currentUserStore.getState().currentUser;
    const { selectedRestaurantId } = adminScopeStore.getState();

    if (token) {
      config.headers.Authorization = `Token ${token}`;
      if (consumeAdminActivitySignal()) {
        config.headers['X-Admin-User-Activity'] = '1';
      } else {
        delete config.headers['X-Admin-User-Activity'];
      }
    }

    if (currentUser?.isSuperuser) {
      if (selectedRestaurantId) {
        config.headers['X-Admin-Restaurant-Id'] = selectedRestaurantId;
      } else {
        delete config.headers['X-Admin-Restaurant-Id'];
      }
    } else {
      delete config.headers['X-Admin-Restaurant-Id'];
    }

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
      }
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }

    config.headers['Accept-Language'] = language;
    config.headers['X-Language'] = language;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const config = error.config as
      | (InternalAxiosRequestConfig & {
          _adminAuthRetry?: boolean;
        })
      | undefined;
    const responseCode = error.response?.data?.code as string | undefined;

    if (error.response?.status === 423 || responseCode === 'session_locked') {
      markAdminSessionLocked(error.response?.data?.lockedAt ?? error.response?.data?.locked_at);
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && config && !config._adminAuthRetry) {
      config._adminAuthRetry = true;
      try {
        const credentials = await refreshAdminSession();
        config.headers.Authorization = `Token ${credentials.accessToken}`;
        return instance(config);
      } catch (refreshError) {
        const refreshCode = (refreshError as { response?: { data?: { code?: string } } }).response?.data?.code;
        if (refreshCode === 'session_locked') {
          markAdminSessionLocked();
        } else if (getAdminAuthErrorStatus(refreshError) === 401) {
          clearAdminAuthentication();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
