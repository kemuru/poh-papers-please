import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5175, strictPort: true },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Stylesheets stay empty in tests, except where a test reads one as text (src/ui/look.test.ts).
    css: { include: [/\.css\?raw$/] },
  },
});
