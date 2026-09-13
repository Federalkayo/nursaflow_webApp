/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GROQ_MODEL: string;
  readonly VITE_ZEGOCLOUD_APP_ID: string;
  readonly VITE_ZEGOCLOUD_SERVER_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
