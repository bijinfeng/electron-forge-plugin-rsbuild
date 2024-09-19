import { defineConfig, mergeRsbuildConfig, RsbuildConfig } from '@rsbuild/core';
import { getBuildConfig, getBuildDefine } from "./rsbuild.base.config"

export default defineConfig((env) => {
  const config: RsbuildConfig = {
    source: {
      define: getBuildDefine(),
      entry: {
        main: "src/main.ts"
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
