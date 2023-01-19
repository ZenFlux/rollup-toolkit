/**
 * @author: Leonid Vinikov <leonidvinikov@gmail.com>
 */
import { GlobalsOption, ModuleFormat, WarningHandlerWithDefault } from "rollup";

export type TZenFluxFormatType = 'cjs' | 'es' | 'esm' | 'umd';

export interface IZenFluxCommonPluginArgs {
    babelExcludeNodeModules?: boolean;
    babelHelpers?: 'bundled' | 'runtime' | 'inline' | 'external';
    babelUseRuntime?: boolean;
    babelUseESModules?: boolean;
    createDeclaration?: boolean;
    extensions?: string[],
    minify?: boolean;
}

export interface IZenFluxMakeOutputArgs {
    ext?: string;
    format: ModuleFormat;
    globals?: GlobalsOption;
    name: string;
}

export interface IZenFluxMakeConfArgs {
    extensions: string[],
    external?: string[] | RegExp[],
    format: TZenFluxFormatType
    globals?: GlobalsOption,
    inputFileName: string,
    onWarn?: WarningHandlerWithDefault,
    outputFileName: string,
    outputName?: string,
}

export interface IZenFluxRollupConfig extends Omit<IZenFluxMakeConfArgs, 'format'> {
    format: TZenFluxFormatType [];
}
