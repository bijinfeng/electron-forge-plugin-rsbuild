import { LibConfig, defineConfig } from "@rslib/core";

const libConfig: LibConfig = {
  autoExternal: {
    dependencies: true,
    devDependencies: true,
  },
  dts: {
    bundle: false,
  }
};

export default defineConfig({
  lib: [
    {
      ...libConfig,
      format: "esm",
      output: {
        distPath: {
          root: './dist/esm',
        },
      },
    },
    {
      ...libConfig,
      format: "cjs",
      output: {
        distPath: {
          root: './dist/cjs',
        },
      },
    }
  ],
  output: {
    target: "node",
  },
});
