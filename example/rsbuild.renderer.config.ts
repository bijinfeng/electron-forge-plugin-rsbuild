import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

export default defineConfig(() => {
  return {
    html: {
      template: './index.html',
    },
    source: {
      entry: {
        index: 'src/renderer.ts',
      },
    },
    plugins: [pluginReact()],
  }
})
