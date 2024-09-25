import { type RsbuildConfig, mergeRsbuildConfig } from "@rsbuild/core";
import { getBuildConfig, getBuildDefine } from "./rsbuild.base.config";

import type { ConfigEnv } from "../config-types";

export function getConfig(forgeEnv: ConfigEnv<"build">): RsbuildConfig {
	const { forgeConfigSelf } = forgeEnv;
	const define = getBuildDefine(forgeEnv);

	const config: RsbuildConfig = {
		source: {
			define: define,
			entry: {
				main: forgeConfigSelf.entry,
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
