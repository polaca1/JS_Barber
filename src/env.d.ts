/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_BOOKSY_URL: string;
  readonly PUBLIC_WHATSAPP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
