/**
 * @author: Leonid Vinikov <leonidvinikov@gmail.com>
 */
import { GlobalsOption, ModuleFormat, WarningHandlerWithDefault } from "rollup";

export type TZenFluxFormatType = 'cjs' | 'es' | 'esm' | 'umd';
export type TZenBabelHelperType = 'bundled' | 'runtime' | 'inline' | 'external'

export interface IZenFluxCommonPluginArgs {
    babelExcludeNodeModules?: boolean;
    babelHelper?: TZenBabelHelperType;
    babelUseESModules?: boolean;
    extensions: string[],
    format: ModuleFormat;
    minify: boolean;
}

export interface IZenFluxMakeOutputArgs {
    ext?: string;
    format: ModuleFormat;
    globals?: GlobalsOption;
    outputFileName: string;
    outputName: string,
}

export interface IZenFluxMakeConfArgs {
    extensions: string[],
    external?: string[] | RegExp[],
    format: TZenFluxFormatType
    globals?: GlobalsOption,
    inputFileName: string,
    onWarn?: WarningHandlerWithDefault,
    outputFileName: string,
    outputName: string,
}

export interface IZenFluxRollupConfig extends Omit<IZenFluxMakeConfArgs, 'format'> {
    format: TZenFluxFormatType [];
}
