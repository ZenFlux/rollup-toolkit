/**
 * @author: Leonid Vinikov <leonidvinikov@gmail.com>
 */
import type {
    RollupOptions,
    OutputPlugin,
    OutputOptions, ModuleFormat,
} from 'rollup';

import babel, { RollupBabelInputPluginOptions } from '@rollup/plugin-babel'
import nodeResolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser';
import typescript, { RollupTypescriptOptions } from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'

import {
    IZenFluxPluginArgs,
    IZenFluxOutputArgs,
    IZenFluxConfigArgs,
    IZenToolkitConfig,
} from "../interfaces/toolkit";

import E_ERROR_CODES from "../errors/codes";

import * as path from "path";
import * as fs from "fs";

const gPackageJSON = JSON.parse( fs.readFileSync( path.join( __dirname, "./../../package.json" ), "utf8" ) ),
    gBabelRuntimeVersion = gPackageJSON.dependencies[ '@babel/runtime' ].replace( /^[^0-9]*/, '' ),
    gTargetPath = process.cwd();


let gToolkitConfig: IZenToolkitConfig = {} as IZenToolkitConfig;

/**
 * Function setToolkitConfig().
 *
 * @internal
 *
 * The method sets the toolkit config. and it has nothing to-do with rollup config.
 * Used to pass the `rollup.toolkit.ts` config core.
 */
export function setToolkitConfig( config: IZenToolkitConfig ) {
    gToolkitConfig = config;
}

export function getTSConfigPath( format: ModuleFormat ): string {
    const result: RollupTypescriptOptions = {},
        { verboseTSConfig = false } = gToolkitConfig.toolkitOptions || {},
        targetExist = ( path: string ) => {
            if ( verboseTSConfig ) {
                console.log( `Checking for '${ path }'` );
            }

            const result = fs.existsSync( path );

            if ( verboseTSConfig ) {
                if ( result ) {
                    console.log( `Found '${ path }'` );
                } else {
                    console.log( `Not found '${ path }'` );
                }
            }

            return result;
        };

    if ( 'development' === process.env.NODE_ENV ) {
        const tsConfigDevFormatPath = path.join( gTargetPath, `tsconfig.${ format }.dev.json` ),
            tsConfigDevPath = path.join( gTargetPath, 'tsconfig.dev.json' );

        if ( targetExist( tsConfigDevFormatPath ) ) {
            return tsConfigDevFormatPath;
        } else if ( targetExist( tsConfigDevPath ) ) {
            return tsConfigDevPath;
        }
    }

    const tsConfigFormatPath = path.join( gTargetPath, `tsconfig.${ format }.json` );

    if ( targetExist( tsConfigFormatPath ) ) {
        return tsConfigFormatPath;
    }

    const tsConfigPath = path.join( gTargetPath, 'tsconfig.json' );

    if ( targetExist( tsConfigPath ) ) {
        return tsConfigPath;
    }


    console.error( "'tsconfig.json' not found." );
    process.exit( E_ERROR_CODES.TS_CONFIG_NOT_FOUND );
}

export const getPlugins = ( args: IZenFluxPluginArgs ): OutputPlugin[] => {
    const { extensions, format } = args;

    const plugins = [
        nodeResolve( {
            extensions,
        } ),
    ];

    const tsConfig: RollupTypescriptOptions = {},
        path = getTSConfigPath( format );

    if ( path ) {
        tsConfig.tsconfig = path;
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
            version: gBabelRuntimeVersion,
            useESModules: true,
        } ] );
    } else {
        babelConfig.plugins?.push( [ '@babel/plugin-transform-runtime', { version: gBabelRuntimeVersion } ] );
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

export const getOutput = ( args: IZenFluxOutputArgs ): OutputOptions => {
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

    if ( outputName ) {
        result.name = outputName;
    }

    return result;
};

export const getConfig = ( args: IZenFluxConfigArgs ): RollupOptions => {
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
    } as IZenFluxOutputArgs;

    if ( 'esm' === format ) {
        outputArgs.ext = 'mjs';
    }

    if ( outputName ) {
        outputArgs.outputName = outputName;
    }

    result.output = getOutput( outputArgs );

    const pluginsArgs: IZenFluxPluginArgs = {
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
