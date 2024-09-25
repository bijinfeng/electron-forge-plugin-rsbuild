import type { RsbuildMode } from "@rsbuild/core";

export interface RsbuildPluginBuildConfig {
	/**
	 * Alias of `source.entry` in `config`.
	 */
	entry: string;
	/**
	 * Rsbuild config file path.
	 */
	config: string;
	/**
	 * The build target is main process or preload script.
	 * @defaultValue 'main'
	 */
	target?: "main" | "preload";
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
	// @defaultValue '.rsbuild'
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

export interface ConfigEnv<
	K extends keyof RsbuildPluginConfig = keyof RsbuildPluginConfig,
> {
	root: string;
	mode: RsbuildMode;
	command: "build" | "serve";
	forgeConfig: RsbuildPluginConfig;
	forgeConfigSelf: RsbuildPluginConfig[K][number];
}
