import type { SourceConfig } from "@rsbuild/core"

export interface RsbuildPluginBuildConfig {
  /**
   * Alias of `source.entry` in `config`.
   */
  entry?: SourceConfig['entry'];
  /**
   * Rsbuild config file path.
   */
  config: string;
}

export interface RsbuildPluginRendererConfig {
  /**
   * Human friendly name of your entry point.
   */
  name?: string;
  /**
   * Rsbuild config file path.
   */
  config: string;
}

export interface RsbuildPluginConfig {
  // Reserved option, may support modification in the future.
  // @defaultValue '.vite'
  // baseDir?: string;

  /**
   * Build anything such as Main process, Preload scripts and Worker process, etc.
   */
  build: RsbuildPluginBuildConfig[];
  /**
   * Renderer process Rsbuild configs.
   */
  renderer: RsbuildPluginRendererConfig[];
}
