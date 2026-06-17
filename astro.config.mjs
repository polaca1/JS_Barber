import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind()],
  vite: {
    optimizeDeps: {
      noDiscovery: true,
      include: [],
    },
    ssr: {
      optimizeDeps: {
        noDiscovery: true,
        include: [],
      },
    },
  },
});
