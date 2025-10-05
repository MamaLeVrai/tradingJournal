import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// minimal declaration to avoid needing full @types/node just for process here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any;

// IMPORTANT: change repoName if different on GitHub
const repoName = 'tradingJournal';
const isGhPages = process.env.GH_PAGES === '1';

export default defineConfig({
  // Use repo sub-path only on GitHub Pages build
  base: isGhPages ? `/${repoName}/` : '/',
  plugins: [react()],
});
