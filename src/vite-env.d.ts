/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVER_URL?: string;
  readonly VITE_ASSETS_DIR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
