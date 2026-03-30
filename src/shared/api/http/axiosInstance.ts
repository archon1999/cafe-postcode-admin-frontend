import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import { authStore } from 'modules/auth';
import { adminScopeStore, currentUserStore } from 'modules/auth/domain';

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
    const requestUrl = error.config?.url ?? '';
    const isLoginRequest = requestUrl.includes('/api/v1/admin/auth/login/');

    if (error.response?.status === 401 && !isLoginRequest) {
      authStore.getState().logout();

      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  },
);
