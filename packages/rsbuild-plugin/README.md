## electron-forge-plugin-rsbuild

This plugin makes it easy to set up standard rsbuild tooling to compile both your main process code and your renderer process code, with built-in support for Hot Module Replacement (HMR) in the renderer process and support for multiple renderers.

```javascript
// forge.config.js

module.exports = {
  plugins: [
    {
      name: 'electron-forge-plugin-rsbuild',
      config: {
        // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
        // If you are familiar with Rebuild configuration, it will look really familiar.
        build: [
          {
            entry: 'src/main.js',
            config: 'rsbuild.main.config.mjs',
            target: 'main'
          },
          {
            entry: 'src/preload.js',
            config: 'rsbuild.preload.config.mjs',
            target: 'preload'
          }
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'rsbuild.renderer.config.mjs'
          }
        ]
      }
    }
  ]
};
```
