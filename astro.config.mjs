// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// URL shape is deliberately pinned to match the pre-Astro site exactly:
//   build.format: 'file'   -> dist/heart-symbols.html (not heart-symbols/index.html)
//   trailingSlash: 'never' -> /heart-symbols, never /heart-symbols/
// Changing either of these would break existing indexed URLs.
export default defineConfig({
  site: 'https://cool-symbols.net',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
    inlineStylesheets: 'always',
  },
  adapter: vercel({
    maxDuration: 15,
  }),
  devToolbar: {
    enabled: false,
  },
});
