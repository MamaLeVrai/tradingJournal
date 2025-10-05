import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// IMPORTANT: change repoName if different on GitHub
const repoName = 'tradingJournal';

export default defineConfig({
  // GitHub Pages needs absolute path with repo slug
  base: `/${repoName}/`,
  plugins: [react()],
});
