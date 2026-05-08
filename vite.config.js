import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// For GitHub Pages, set base to "/your-repo-name/" before deploying.
// For local dev or custom domains, leave as "/".
export default defineConfig({
  plugins: [react()],
  base: './',
});
