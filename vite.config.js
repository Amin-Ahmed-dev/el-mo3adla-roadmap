import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes the build work on any host or sub-path (Cloudflare Pages, GitHub Pages project sites, Netlify...).
export default defineConfig({
  base: './',
  plugins: [react()],
});
