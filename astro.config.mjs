import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

/**
 * AcademicCite 生产配置
 * - hybrid 模式：静态页面预渲染，动态 DOI 路由强制 SSR
 * - Cloudflare adapter 直接输出 Workers 兼容产物
 */
export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  integrations: [
    tailwind({
      applyBaseStyles: false
    })
  ],
  // 确保动态路由不被预渲染
  vite: {
    ssr: {
      external: ['node:buffer']
    }
  }
});