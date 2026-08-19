/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL?: string;
  readonly VITE_ASSETS_DIR?: string;
  readonly VITE_CONTROL_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
