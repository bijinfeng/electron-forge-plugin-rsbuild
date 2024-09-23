
export { }; // Make this a module

declare global {
  const MAIN_WINDOW_RSBUILD_DEV_SERVER_URL: string;
  const MAIN_WINDOW_RSBUILD_NAME: string;

  interface RsbuildPluginRuntimeKeys {
    RSBUILD_DEV_SERVER_URL: `${string}_RSBUILD_DEV_SERVER_URL`;
    RSBUILD_NAME: `${string}_RSBUILD_NAME`;
  }
}
