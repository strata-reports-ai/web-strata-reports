import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://stratareport.ai',
  output: 'static',
  compressHTML: true,
  integrations: [sitemap()],
})
