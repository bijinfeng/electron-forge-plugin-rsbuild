import path from 'node:path';

import { namedHookWithTaskFn, PluginBase } from '@electron-forge/plugin-base';
import { logger } from '@rsbuild/core';
import debug from 'debug';
import fs from 'fs-extra';
import { PRESET_TIMER } from 'listr2';
import { createRsbuild } from '@rsbuild/core';

import { getFlatDependencies } from './utils/package';
import RsbuildConfigGenerator from "./rsbuild-config";

import type { RsbuildPluginConfig } from './config-types';
import type { ForgeMultiHookMap, ResolvedForgeConfig, StartResult } from '@electron-forge/shared-types';

const d = debug('electron-forge:plugin:rsbuild');

export default class RsbuildPlugin extends PluginBase<RsbuildPluginConfig> {
  private static alreadyStarted = false;

  public name = 'rsbuild';

  private isProd = false;

  // The root of the Electron app
  private projectDir!: string;

  // Where the Vite output is generated. Usually `${projectDir}/.rsbuild`
  private baseDir!: string;

  private configGeneratorCache!: RsbuildConfigGenerator;

  private servers: { close: () => void }[] = [];

  init = (dir: string): void => {
    this.setDirectories(dir);

    d('hooking process events');
    process.on('exit', (_code) => this.exitHandler({ cleanup: true }));
    process.on('SIGINT' as NodeJS.Signals, (_signal) => this.exitHandler({ exit: true }));
  };

  public setDirectories(dir: string): void {
    this.projectDir = dir;
    this.baseDir = path.join(dir, '.rsbuild');
  }

  private get configGenerator(): RsbuildConfigGenerator {
    return (this.configGeneratorCache ??= new RsbuildConfigGenerator(this.config, this.projectDir, this.isProd));
  }

  getHooks = (): ForgeMultiHookMap => {
    return {
      prePackage: [
        namedHookWithTaskFn<'prePackage'>(async () => {
          this.isProd = true;
          await fs.remove(this.baseDir);

          await Promise.all([this.build(), this.buildRenderer()]);
        }, 'Building rsbuild bundles'),
      ],
      postStart: async (_config, child) => {
        d('hooking electron process exit');
        child.on('exit', () => {
          if (child.restarted) return;
          this.exitHandler({ cleanup: true, exit: true });
        });
      },
      resolveForgeConfig: this.resolveForgeConfig,
      packageAfterCopy: this.packageAfterCopy,
    };
  };

  resolveForgeConfig = async (forgeConfig: ResolvedForgeConfig): Promise<ResolvedForgeConfig> => {
    forgeConfig.packagerConfig ??= {};

    if (forgeConfig.packagerConfig.ignore) {
      if (typeof forgeConfig.packagerConfig.ignore !== 'function') {
        logger.error(`You have set packagerConfig.ignore, the Electron Forge Vite plugin normally sets this automatically. \n Your packaged app may be larger than expected if you dont ignore everything other than the '.rsbuild' folder`)
      }
      return forgeConfig;
    }

    forgeConfig.packagerConfig.ignore = (file: string) => {
      if (!file) return false;

      // Always starts with `/`
      // @see - https://github.com/electron/packager/blob/v18.1.3/src/copy-filter.ts#L89-L93
      return !file.startsWith('/.rsbuild');
    };

    return forgeConfig;
  };

  packageAfterCopy = async (_forgeConfig: ResolvedForgeConfig, buildPath: string): Promise<void> => {
    const pj = await fs.readJson(path.resolve(this.projectDir, 'package.json'));
    const flatDependencies = await getFlatDependencies(this.projectDir);

    if (!pj.main?.includes('.rsbuild/')) {
      throw new Error(`Electron Forge is configured to use the Vite plugin. The plugin expects the
"main" entry point in "package.json" to be ".rsbuild/*" (where the plugin outputs
the generated files). Instead, it is ${JSON.stringify(pj.main)}`);
    }

    if (pj.config) {
      delete pj.config.forge;
    }

    await fs.writeJson(path.resolve(buildPath, 'package.json'), pj, {
      spaces: 2,
    });

    // Copy the dependencies in package.json
    for (const dep of flatDependencies) {
      await fs.copy(dep.src, path.resolve(buildPath, dep.dest));
    }
  };

  startLogic = async (): Promise<StartResult> => {
    if (RsbuildPlugin.alreadyStarted) return false;
    RsbuildPlugin.alreadyStarted = true;

    await fs.remove(this.baseDir);

    return {
      tasks: [
        {
          title: 'Launching dev servers for renderer process code',
          task: async () => {
            await this.launchRendererDevServers();
          },
          rendererOptions: {
            persistentOutput: true,
            timer: { ...PRESET_TIMER },
          },
        },
        // The main process depends on the `server.port` of the renderer process, so the renderer process is run first.
        {
          title: 'Compiling main process code',
          task: async () => {
            await this.build();
          },
          rendererOptions: {
            timer: { ...PRESET_TIMER },
          },
        },
      ],
      result: false,
    };
  };

  // Main process, Preload scripts and Worker process, etc.
  build = async (): Promise<void> => {
    const configs = await this.configGenerator.getBuildConfig();

    await Promise.all(configs.map(async userConfig => {
      const rsbuild = await createRsbuild({ rsbuildConfig: userConfig });
      const result = await rsbuild.build({ watch: true });
      this.servers.push(result);
    }));
  };

  // Renderer process
  buildRenderer = async (): Promise<void> => {
    for (const userConfig of await this.configGenerator.getRendererConfig()) {
      const rsbuild = await createRsbuild({ rsbuildConfig: userConfig });

      const server = await rsbuild.build();
      this.servers.push(server);
    }
  };

  launchRendererDevServers = async (): Promise<void> => {
    for (const userConfig of await this.configGenerator.getRendererConfig()) {
      const rsbuild = await createRsbuild({ rsbuildConfig: userConfig });
      const { server } = await rsbuild.startDevServer();
      this.servers.push(server);
    }
  };

  exitHandler = (options: { cleanup?: boolean; exit?: boolean }, err?: Error): void => {
    d('handling process exit with:', options);
    if (options.cleanup) {
      for (const server of this.servers) {
        d('cleaning http server');
        server.close();
      }
      this.servers = [];
    }
    if (err) console.error(err.stack);
    // Why: This is literally what the option says to do.
    // eslint-disable-next-line no-process-exit
    if (options.exit) process.exit();
  };
}

export { RsbuildPlugin };
