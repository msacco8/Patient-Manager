/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Define your environment variables here
  readonly VITE_BACKEND_URL: string;

  // More variables can be added here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
