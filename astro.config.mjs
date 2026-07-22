import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.adamtank.com',
  trailingSlash: 'never',
  build: { format: 'directory' },
  integrations: [sitemap()],
});
