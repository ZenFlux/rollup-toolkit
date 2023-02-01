# rollup-toolkit
Shorten `rollup.config.ts` and make the config more common.
---
### How to use?

- 
  ```console
  foo@bar:~$ npm i @zenflux/rollup-toolkit --save-dev
  ```

-
  Create a file `rollup.toolkit.ts`, Here is the example:

  ```ts
  import { WarningHandlerWithDefault } from "rollup";
  import { IZenFluxRollupToolkitOptions, IZenToolkitConfig } from "@zenflux/rollup-toolkit";
  
  const onWarn: WarningHandlerWithDefault = ( warning, warn ) => {
      // Handle issue with redux/toolkit.
      if ( warning.code === 'THIS_IS_UNDEFINED' ) {
          return false;
      }
  }
  
  const toolkitOptions: IZenFluxRollupToolkitOptions = {
    verboseTSConfig: true,
  };

  const config: IZenToolkitConfig = {
      format: [ 'cjs', 'es', 'esm', 'umd' ],
      extensions: [ '.ts' ],
      inputFileName: 'src/index.ts',
      outputName: '@zenflux/redux',
      outputFileName: 'zenflux-redux',
      globals: {
          jquery: "jQuery",
      },
      external: [
          '@babel/runtime',
          '@reduxjs/toolkit',
          '@zenflux/core',
          'react',
          'react-dom',
          'react-redux'
      ],
      'onWarn': onWarn,
  }

  export default config;
  ```
- Edit `package.json`
  Add scripts:
    ```json
    "toolkit-build": "node_modules/@zenflux/rollup-toolkit/bin/run @build",
    "toolkit-build-dev": "node_modules/@zenflux/rollup-toolkit/bin/dev @build",
    "toolkit-watch": "node_modules/@zenflux/rollup-toolkit/bin/run @watch",
    "toolkit-watch-dev": "node_modules/@zenflux/rollup-toolkit/bin/dev @watch"
    ```
  
## `tsconfig.json` fallback:
- Dev
    - `tsconfig.{format}.dev.json`
    - `tsconfig.dev.json`
- Prod
    - `tsconfig.{format}.json`
    - `tsconfig.json`
