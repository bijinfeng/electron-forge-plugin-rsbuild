import { RsbuildConfig } from "@rsbuild/core";
import { builtinModules } from 'node:module';
import pkg from '../package.json';

import type { RsbuildPlugin } from '@rsbuild/core';

export const builtins = ['electron', ...builtinModules.map((m) => [m, `node:${m}`]).flat()];

export const externals = [...builtins, ...Object.keys('dependencies' in pkg ? (pkg.dependencies as Record<string, unknown>) : {})];

export function getBuildConfig(): RsbuildConfig {
  return {
    output: {
      externals,
      cleanDistPath: false,
      target: "node",
      distPath: {
        root: ".rsbuild/build"
      }
    }
  }
}

export function getDefineKeys(names: string[]) {
  const define: { [name: string]: VitePluginRuntimeKeys } = {};

  return names.reduce((acc, name) => {
    const NAME = name.toUpperCase();
    const keys: VitePluginRuntimeKeys = {
      VITE_DEV_SERVER_URL: `${NAME}_VITE_DEV_SERVER_URL`,
      VITE_NAME: `${NAME}_VITE_NAME`,
    };

    return { ...acc, [name]: keys };
  }, define);
}

export function getBuildDefine() {
  const names = ["main_window"];
  const defineKeys = getDefineKeys(names);

  const define = Object.entries(defineKeys).reduce((acc, [name, keys]) => {
    const { VITE_DEV_SERVER_URL, VITE_NAME } = keys;
    const def = {
      [VITE_DEV_SERVER_URL]: JSON.stringify(process.env[VITE_DEV_SERVER_URL]),
      [VITE_NAME]: JSON.stringify(name),
    };
    return { ...acc, ...def };
  }, {} as Record<string, any>);

  return define;
}

export const pluginExposeRenderer = (name: string): RsbuildPlugin => {
  const { VITE_DEV_SERVER_URL } = getDefineKeys([name])[name];

  return {
    name: "@electron-forge/plugin-rsbuild:expose-renderer",
    setup(api) {
      api.onAfterStartDevServer(({ port }) => {
        console.log('this port is: ', port);
        process.env[VITE_DEV_SERVER_URL] = `http://localhost:${port}`;
      });
    }
  }
}