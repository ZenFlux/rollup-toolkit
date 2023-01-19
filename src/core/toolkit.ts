/**
 * @author: Leonid Vinikov <leonidvinikov@gmail.com>
 */
import type {
    RollupOptions,
    OutputPlugin,
    OutputOptions,
} from 'rollup';

import babel, { RollupBabelInputPluginOptions } from '@rollup/plugin-babel'
import json from "@rollup/plugin-json";
import nodeResolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser';
import typescript, { RollupTypescriptOptions } from '@rollup/plugin-typescript'

import { IZenFluxCommonPluginArgs, IZenFluxMakeConfArgs, IZenFluxMakeOutputArgs } from "../types/toolkit";

import E_ERROR_CODES from "../errors/codes";

import * as path from "path";
import * as fs from "fs";

const pkg = JSON.parse( fs.readFileSync( path.join( __dirname, "./../../package.json" ), "utf8" ) );

const babelRuntimeVersion = pkg.dependencies[ '@babel/runtime' ].replace( /^[^0-9]*/, '' );

export const makePlugins = ( args: IZenFluxCommonPluginArgs = {} ): OutputPlugin[] => {
    const { extensions } = args;

    const plugins = [
        nodeResolve( {
            extensions,
        } ),
    ];

    const tsConfig: RollupTypescriptOptions = {};

    tsConfig.tsconfig = path.join( process.cwd(), 'tsconfig.json' );

    if ( 'development' === process.env.NODE_ENV) {
        tsConfig.sourceMap = true;
        tsConfig.sourceRoot = path.join( process.cwd(), 'src/' );
        tsConfig.inlineSourceMap = true;
    }

    tsConfig.declaration = args.createDeclaration || false;

    plugins.push( typescript( tsConfig ) );

    const babelConfig: RollupBabelInputPluginOptions = {
        extensions,
        plugins: [],
        babelHelpers: args.babelHelpers,
    };

    if ( args.babelExcludeNodeModules ) {
        babelConfig.exclude = 'node_modules/**';
    }

    if ( args.babelUseESModules ) {
        babelConfig.plugins?.push( [ '@babel/plugin-transform-runtime', {
            version: babelRuntimeVersion,
            useESModules: true,
        } ] );
    } else if ( args.babelUseRuntime ) {
        babelConfig.plugins?.push( [ '@babel/plugin-transform-runtime', { version: babelRuntimeVersion } ] );
    }

    if ( 'bundled' === args.babelHelpers ) {
        babelConfig.skipPreflightCheck = true;
    }

    plugins.push( babel( babelConfig ) );

    plugins.push( json() );

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

export const makeOutput = ( args: IZenFluxMakeOutputArgs ): OutputOptions => {
    const { format, ext = 'js' } = args;

    return {
        format,
        globals: args.globals,
        file: `dist/${ format }/${ args.name }.${ ext }`,
        indent: false,
        exports: 'named',
        sourcemap: 'development' === process.env.NODE_ENV ? 'inline' : false,
    }
};

export const makeConfig = ( args: IZenFluxMakeConfArgs ): RollupOptions => {
    const {
        format,
        globals = {},
        extensions = [ '.ts' ],
        external = [],
        inputFileName,
        outputName,
        outputFileName
    } = args;

    const sharedGeneralConf: any = {
        input: inputFileName,
        external
    } as RollupOptions;

    const result: RollupOptions = { ...sharedGeneralConf };

    switch ( format ) {
        case 'cjs':
            result.output = makeOutput( {
                name: outputFileName,
                format: 'cjs',
            } );
            result.plugins = makePlugins( {
                extensions,
                createDeclaration: false,
                babelUseRuntime: true,
                babelHelpers: 'runtime'
            } );
            break;

        case 'es':
            result.output = makeOutput( {
                name: outputFileName,
                format: 'es',
            } );
            result.plugins = makePlugins( {
                extensions,
                createDeclaration: true,
                babelUseESModules: true,
                babelHelpers: 'runtime',
            } );
            break;

        case 'esm':
            result.output = {
                ...makeOutput( {
                    name: outputFileName,
                    format: 'es',
                    ext: 'mjs',
                } ),
                name: outputName,
            };
            result.plugins = makePlugins( {
                extensions,
                createDeclaration: false,
                babelUseRuntime: true,
                babelHelpers: 'bundled',
                minify: true,
            } );
            break;

        case 'umd':
            result.output = {
                ...makeOutput( {
                    name: outputFileName,
                    format: 'umd',
                    globals,
                } ),
                name: outputName,
            };
            result.plugins = makePlugins( {
                extensions,
                createDeclaration: false,
                babelUseRuntime: true,
                babelHelpers: 'bundled',
                babelExcludeNodeModules: true,
            } );
            break;

        default: {
            console.error( `Unknown format: ${ format }` );
            process.exit( E_ERROR_CODES.UNKNOWN_FORMAT );
        }
    }

    return result;
};
