import { loadConfig, mergeRsbuildConfig } from "@rsbuild/core";
import debug from "debug";

import type { RsbuildConfig, RsbuildMode } from "@rsbuild/core";
import type {
	ConfigEnv,
	RsbuildPluginBuildConfig,
	RsbuildPluginConfig,
	RsbuildPluginRendererConfig,
} from "./config-types";

import { getConfig as getMainRsbuildConfig } from "./config/rsbuild.main.config";
import { getConfig as getPreloadRsbuildConfig } from "./config/rsbuild.preload.config";
import { getConfig as getRendererRsbuildConfig } from "./config/rsbuild.renderer.config";

const d = debug("@electron-forge/plugin-rsbuild:RsbuildConfig");

type Target = NonNullable<RsbuildPluginBuildConfig["target"]> | "renderer";

export default class RsbuildConfigGenerator {
	constructor(
		private readonly pluginConfig: RsbuildPluginConfig,
		private readonly projectDir: string,
		private readonly isProd: boolean,
	) {
		d("Config mode:", this.mode);
	}

	async resolveConfig(
		buildConfig: RsbuildPluginBuildConfig | RsbuildPluginRendererConfig,
		target: Target,
	): Promise<RsbuildConfig> {
		const { content } = await loadConfig({
			cwd: this.projectDir,
			path: buildConfig.config,
			envMode: this.mode,
		});

		const configEnv: ConfigEnv = {
			command: this.isProd ? "build" : "serve",
			mode: this.mode,
			root: this.projectDir,
			forgeConfig: this.pluginConfig,
			forgeConfigSelf: buildConfig,
		};

		switch (target) {
			case "main":
				return mergeRsbuildConfig(
					getMainRsbuildConfig(configEnv as ConfigEnv<"build">),
					content,
				);
			case "preload":
				return mergeRsbuildConfig(
					getPreloadRsbuildConfig(configEnv as ConfigEnv<"build">),
					content,
				);
			case "renderer":
				return mergeRsbuildConfig(
					getRendererRsbuildConfig(configEnv as ConfigEnv<"renderer">),
					content,
				);
			default:
				throw new Error(
					`Unknown target: ${target}, expected 'main', 'preload' or 'renderer'`,
				);
		}
	}

	get mode(): RsbuildMode {
		// Vite's `mode` can be passed in via command.
		// Since we are currently using the JavaScript API, we are opinionated defining two default values for mode here.
		// The `mode` set by the end user in `vite.config.js` has a higher priority.
		return this.isProd ? "production" : "development";
	}

	async getBuildConfig(): Promise<RsbuildConfig[]> {
		if (!Array.isArray(this.pluginConfig.build)) {
			throw new Error('"config.build" must be an Array');
		}

		const configs = this.pluginConfig.build
			// Prevent load the default `vite.config.js` file.
			.filter(({ config }) => config)
			.map<Promise<RsbuildConfig>>(
				async (buildConfig) =>
					await this.resolveConfig(buildConfig, buildConfig.target ?? "main"),
			);

		return await Promise.all(configs);
	}

	async getRendererConfig(): Promise<RsbuildConfig[]> {
		if (!Array.isArray(this.pluginConfig.renderer)) {
			throw new Error('"config.renderer" must be an Array');
		}

		const configs = this.pluginConfig.renderer
			.filter(({ config }) => config)
			.map<Promise<RsbuildConfig>>(
				async (buildConfig) =>
					await this.resolveConfig(buildConfig, "renderer"),
			);

		return await Promise.all(configs);
	}
}
