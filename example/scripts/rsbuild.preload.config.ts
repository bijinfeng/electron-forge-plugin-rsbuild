import { defineConfig } from '@rsbuild/core';
import { externals } from "./rsbuild.base.config"

export default defineConfig({
  output: {
    externals,
  }
});
