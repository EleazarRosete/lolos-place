import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',  // Output directory for the build files
    assetsDir: '',   // Make sure assets go directly into the dist folder
    rollupOptions: {
      input: './index.html', // Ensure index.html is treated as the entry point
    },
  },
})
