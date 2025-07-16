import { defineConfig } from 'tsdown';

export default defineConfig({
  platform: 'browser',
  format: 'esm',
  dts: true,
});
