import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// minimal declaration to avoid needing full @types/node just for process here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const process: any;

export default defineConfig({
  // Project site deployment at https://mamalevrai.github.io/tradingJournal/
  base: '/tradingJournal/',
  plugins: [react()],
});
