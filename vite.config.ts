import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// minimal declaration to avoid needing full @types/node just for process here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any;

export default defineConfig({
  // Deploying to user/organisation site (mamalevrai.github.io) => base '/'
  // If you move to project page, change to '/tradingJournal/'
  base: '/',
  plugins: [react()],
});
