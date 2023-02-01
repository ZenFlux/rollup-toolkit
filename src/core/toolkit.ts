/**
 * @author: Leonid Vinikov <leonidvinikov@gmail.com>
 */
import type {
    RollupOptions,
    OutputPlugin,
    OutputOptions,
} from 'rollup';

import babel, { RollupBabelInputPluginOptions } from '@rollup/plugin-babel'
import nodeResolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser';
import typescript, { RollupTypescriptOptions } from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'

import {
    IZenFluxCommonPluginArgs,
    IZenFluxMakeConfArgs,
    IZenFluxMakeOutputArgs,
} from "../types/toolkit";

import E_ERROR_CODES from "../errors/codes";

import * as path from "path";
import * as fs from "fs";

const pkg = JSON.parse( fs.readFileSync( path.join( __dirname, "./../../package.json" ), "utf8" ) );

const babelRuntimeVersion = pkg.dependencies[ '@babel/runtime' ].replace( /^[^0-9]*/, '' );

export const getPlugins = ( args: IZenFluxCommonPluginArgs ): OutputPlugin[] => {
    const { extensions, format } = args;

    const plugins = [
        nodeResolve( {
            extensions,
        } ),
    ];

    const tsConfig: RollupTypescriptOptions = {},
        targetPath = process.cwd(),
        specificTSConfig = path.join( targetPath, `tsconfig.${ format }.json` );

    if ( fs.existsSync( specificTSConfig ) ) {
        tsConfig.tsconfig = specificTSConfig;
    } else {
        tsConfig.tsconfig = path.join( targetPath, 'tsconfig.json' );
    }

    // TODO: Create tsconfig.dev.json
    if ( 'development' === process.env.NODE_ENV ) {
        tsConfig.sourceMap = true;
        tsConfig.sourceRoot = path.join( targetPath, 'src/' );
        tsConfig.inlineSourceMap = true;
    }

    plugins.push( typescript( tsConfig ) );

    const babelConfig: RollupBabelInputPluginOptions = {
        extensions,
        plugins: [],
        babelHelpers: args.babelHelper,
    };

    if ( args.babelExcludeNodeModules ) {
        babelConfig.exclude = 'node_modules/**';
    }

    if ( args.babelUseESModules ) {
        babelConfig.plugins?.push( [ '@babel/plugin-transform-runtime', {
            version: babelRuntimeVersion,
            useESModules: true,
        } ] );
    } else {
        babelConfig.plugins?.push( [ '@babel/plugin-transform-runtime', { version: babelRuntimeVersion } ] );
    }

    if ( 'bundled' === args.babelHelper ) {
        babelConfig.skipPreflightCheck = true;
    }

    plugins.push( json() );
    plugins.push( babel( babelConfig ) );

    if ( args.minify ) {
        plugins.push( terser( {
            compress: {
                pure_getters: true,
                unsafe: true,
                unsafe_comps: true
            }
        } ) )
    }

    return plugins;
};

export const getOutput = ( args: IZenFluxMakeOutputArgs ): OutputOptions => {
    const {
        ext = 'js',
        format,
        globals,
        outputName,
        outputFileName
    } = args;

    const result = {
        format,
        file: `dist/${ format }/${ outputFileName }.${ ext }`,
        indent: false,
        exports: 'named',
        sourcemap: 'development' === process.env.NODE_ENV ? 'inline' : false,
    } as OutputOptions;

    if ( globals ) {
        result.globals = globals;
    }

    if ( outputName ){
        result.name = outputName;
    }

    return result;
};

export const getConfig = ( args: IZenFluxMakeConfArgs ): RollupOptions => {
    const {
        extensions,
        external = [],
        format,
        globals,
        inputFileName,
        onWarn,
        outputFileName,
        outputName,
    } = args;

    const result: RollupOptions = {
        input: inputFileName,
        external,
    };

    const outputArgs = {
        format,
        globals,
        outputFileName,
    } as IZenFluxMakeOutputArgs;

    if ( 'esm' === format ) {
        outputArgs.ext = 'mjs';
    }

    if ( outputName ) {
        outputArgs.outputName = outputName;
    }

    result.output = getOutput( outputArgs );

    const pluginsArgs: IZenFluxCommonPluginArgs = {
        extensions,
        format,
        minify: 'production' === process.env.NODE_ENV,
    };

    // noinspection FallThroughInSwitchStatementJS
    switch ( format ) {
        case 'es':
            pluginsArgs.babelUseESModules = true;
        case 'cjs':
            pluginsArgs.babelHelper = 'runtime';
            break;

        case 'umd':
            pluginsArgs.babelExcludeNodeModules = true;
        case 'esm':
            pluginsArgs.babelHelper = 'bundled';
            break;

        default: {
            console.error( `Unknown format: ${ format }` );
            process.exit( E_ERROR_CODES.UNKNOWN_FORMAT );
        }
    }

    result.plugins = getPlugins( pluginsArgs );

    if ( onWarn ) {
        result.onwarn = onWarn;
    }

    return result;
};
