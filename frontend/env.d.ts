/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // добавляй сюда другие VITE_* при необходимости
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
