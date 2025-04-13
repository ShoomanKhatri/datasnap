import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // '/track': 'http://localhost:3000',
      '/track': 'https://people-gallery.onrender.com',
     
    },
  },
})
