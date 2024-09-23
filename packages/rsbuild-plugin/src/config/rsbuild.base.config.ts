import { RsbuildConfig } from "@rsbuild/core";
import { builtinModules } from 'node:module';

import type { RsbuildPlugin } from '@rsbuild/core';
import { ConfigEnv } from "../config-types";

export const builtins = ['electron', ...builtinModules.map((m) => [m, `node:${m}`]).flat()];

export const externals = [...builtins];

const viteDevServerUrls: Record<string, string> = {};

export function getBuildConfig(env: ConfigEnv<'build'>): RsbuildConfig {
  const { root, mode, command } = env;

  return {
    root,
    mode,
    output: {
      externals,
      cleanDistPath: false,
      target: "node",
      minify: command === "build",
      distPath: {
        root: ".rsbuild/build"
      },
      sourceMap: {
        js: command === "build" ? "source-map" : false,
      }
    }
  }
}

export function getDefineKeys(names: string[]) {
  const define: { [name: string]: RsbuildPluginRuntimeKeys } = {};

  return names.reduce((acc, name) => {
    const NAME = name.toUpperCase();
    const keys: RsbuildPluginRuntimeKeys = {
      RSBUILD_DEV_SERVER_URL: `${NAME}_RSBUILD_DEV_SERVER_URL`,
      RSBUILD_NAME: `${NAME}_RSBUILD_NAME`,
    };

    return { ...acc, [name]: keys };
  }, define);
}

export function getBuildDefine(env: ConfigEnv<'build'>) {
  const { command, forgeConfig } = env;
  const names = forgeConfig.renderer.filter(({ name }) => name != null).map(({ name }) => name!);
  const defineKeys = getDefineKeys(names);

  const define = Object.entries(defineKeys).reduce((acc, [name, keys]) => {
    const { RSBUILD_DEV_SERVER_URL, RSBUILD_NAME } = keys;
    const def = {
      [RSBUILD_DEV_SERVER_URL]: command === 'serve' ? JSON.stringify(viteDevServerUrls[RSBUILD_DEV_SERVER_URL]) : undefined,
      [RSBUILD_NAME]: JSON.stringify(name),
    };
    return { ...acc, ...def };
  }, {} as Record<string, any>);

  return define;
}

export const pluginExposeRenderer = (name: string): RsbuildPlugin => {
  const { RSBUILD_DEV_SERVER_URL } = getDefineKeys([name])[name];

  return {
    name: "@electron-forge/plugin-rsbuild:expose-renderer",
    setup(api) {
      api.onAfterStartDevServer(({ port }) => {
        viteDevServerUrls[RSBUILD_DEV_SERVER_URL] = `http://localhost:${port}`;
      });
    }
  }
}
