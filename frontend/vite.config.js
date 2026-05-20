import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // you can change the port if needed
  },
  build: {
    outDir: 'build', // matches Create React App's structure
  },
  base: '/Careconnect_react', // change this if deploying to GitHub Pages
});
