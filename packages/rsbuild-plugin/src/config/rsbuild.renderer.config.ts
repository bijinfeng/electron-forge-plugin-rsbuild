import type { RsbuildConfig } from '@rsbuild/core'

import type { ConfigEnv } from '../config-types'
import { pluginExposeRenderer } from './rsbuild.base.config'

export function getConfig(forgeEnv: ConfigEnv<'renderer'>): RsbuildConfig {
  const { root, mode, forgeConfigSelf } = forgeEnv
  const name = forgeConfigSelf.name ?? ''

  return {
    root,
    mode,
    output: {
      assetPrefix: './',
      distPath: {
        root: `.rsbuild/renderer/${name}`,
      },
    },
    plugins: [pluginExposeRenderer(name)],
  }
}
