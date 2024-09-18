import { defineConfig } from "@rslib/core";

export default defineConfig({
  lib: [{
    format: "esm",
    autoExternal: {
      dependencies: true,
      devDependencies: true,
    },
    dts: {
      bundle: false,
    }
  }],
  output: {
    target: "node",
  },
});
