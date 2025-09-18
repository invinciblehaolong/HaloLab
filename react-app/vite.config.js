import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // allowedHosts: 'all',  // 仅开发
    port: 5174, // 改为您想要的端口号，例如 3000
    open: true,  // 可选：自动在浏览器中打开应用,
    allowedHosts: [
        'localhost',
        '7f7e62a91780.ngrok-free.app',
        // 可选：添加通配符支持所有 ngrok 免费域名（避免每次重启 ngrok 都要改）
        '*.ngrok-free.app'
    ],
    cors: {
      origin: [
        'https://0ef47f343a11.ngrok-free.app',
        'https://7f7e62a91780.ngrok-free.app '
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  }
})
