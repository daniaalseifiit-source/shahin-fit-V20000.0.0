import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/app/', // این خط باعث می‌شود فایل‌ها در پوشه app به درستی آدرس‌دهی شوند
})