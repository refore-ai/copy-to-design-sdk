/// <reference types="vite/client" />

// Vite type configuration options
interface ViteTypeOptions {
  // By adding this option, you can strictly restrict the type of ImportMetaEnv and disallow unknown keys
  // strictImportMetaEnv: unknown
}

// Environment variable type definitions
interface ImportMetaEnv {
  // API key for the design tool
  readonly VITE_COPY_TO_DESIGN_KEY: string;
  // API endpoint for the design tool
  readonly VITE_COPY_TO_DESIGN_ENDPOINT: string;
  // More environment variables...
}

// Extend the ImportMeta interface to include environment variables
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
