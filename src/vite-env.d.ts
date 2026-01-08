/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_GA_MEASUREMENT_ID?: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Build-time constants injected by Vite
declare const __BUILD_TIME__: string 