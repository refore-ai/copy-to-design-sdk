/// <reference types="vite/client" />

interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  // strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_COPY_TO_DESIGN_ACCESS_TOKEN: string;
  readonly VITE_COPY_TO_DESIGN_APP_ID: string;
  readonly VITE_COPY_TO_DESIGN_ENDPOINT: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
