import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

import { pluginExposeRenderer } from "./rsbuild.base.config";

export default defineConfig((env) => {
  console.log(11, env);

  return {
    html: {
      template: "./index.html"
    },
    source: {
      entry: {
        index: "src/renderer.ts"
      }
    },
    plugins: [pluginReact(), pluginExposeRenderer("main_window")],
  }
});
