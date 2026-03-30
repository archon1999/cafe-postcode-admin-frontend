export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;

  setAccessToken: (accessToken: string) => void;
  logout: () => void;
  checkAuth: () => void;

  getAccessToken: () => string | null;
}
