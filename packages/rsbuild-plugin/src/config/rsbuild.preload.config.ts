import { type RsbuildConfig, mergeRsbuildConfig } from "@rsbuild/core";
import { getBuildConfig } from "./rsbuild.base.config";

import type { ConfigEnv } from "../config-types";

export function getConfig(forgeEnv: ConfigEnv<"build">): RsbuildConfig {
	const { forgeConfigSelf } = forgeEnv;

	const config: RsbuildConfig = {
		source: {
			entry: {
				preload: forgeConfigSelf.entry,
			},
		},
		output: {
			target: "node",
			filename: {
				js: "[name].js",
			},
		},
	};

	return mergeRsbuildConfig(getBuildConfig(forgeEnv), config);
}
