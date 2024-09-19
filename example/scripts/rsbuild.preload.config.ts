import { defineConfig, mergeRsbuildConfig, RsbuildConfig } from '@rsbuild/core';
import { getBuildConfig } from "./rsbuild.base.config"

export default defineConfig(() => {
  const config: RsbuildConfig = {
    source: {
      entry: {
        preload: "src/preload.ts"
      }
    },
    output: {
      target: "node",
      filename: {
        js: '[name].js',
      }
    }
  };

  return mergeRsbuildConfig(getBuildConfig(), config);
});
