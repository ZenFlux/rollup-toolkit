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
  import { IZenFluxRollupConfig } from "@zenflux/rollup-toolkit";

  const onWarn: WarningHandlerWithDefault = ( warning, warn ) => {
      // Handle issue with redux/toolkit.
      if ( warning.code === 'THIS_IS_UNDEFINED' ) {
          return false;
      }
  }

  const config: IZenFluxRollupConfig = {
      format: [ 'cjs', 'es', 'esm', 'umd-dev', 'umd-prod' ],
      extensions: [ '.ts' ],
      inputFileName: 'src/index.ts',
      outputName: '@zenflux/redux',
      outputFileName: 'zenflux-redux',
      globals: {
          '@zenflux/core': 'ZenCore',
          '@reduxjs/toolkit': 'ReduxToolkit',
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react-redux': 'ReactRedux'
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
  
