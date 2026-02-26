import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Using PostCSS for Tailwind v4 instead of the Vite plugin for better compatibility in this environment
export default defineConfig({
  plugins: [
    react(),
  ],
})
