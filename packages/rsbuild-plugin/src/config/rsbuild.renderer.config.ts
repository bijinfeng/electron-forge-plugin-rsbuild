import { RsbuildConfig } from '@rsbuild/core';

import { pluginExposeRenderer } from "./rsbuild.base.config";
import type { ConfigEnv } from "../config-types";

export function getConfig(forgeEnv: ConfigEnv<"renderer">): RsbuildConfig {
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root,
    mode,
    html: {
      template: "./index.html"
    },
    source: {
      entry: {
        index: "src/renderer.ts"
      }
    },
    output: {
      assetPrefix: "./",
      distPath: {
        root: `.rsbuild/renderer/${name}`,
      }
    },
    plugins: [pluginExposeRenderer(name)],
  }
}
