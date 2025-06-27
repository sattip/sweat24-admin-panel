/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_ENV: string
  readonly VITE_ENABLE_CORS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
