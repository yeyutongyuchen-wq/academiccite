import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

/**
 * AcademicCite 生产配置
 * - 使用 output: 'static'（Astro 新版本已移除 hybrid）
 * - 需要 SSR 的页面通过 export const prerender = false 单独开启
 * - Cloudflare adapter 继续负责边缘运行时
 */
export default defineConfig({
  output: 'static',
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
  vite: {
    ssr: {
      external: ['node:buffer']
    }
  }
});
