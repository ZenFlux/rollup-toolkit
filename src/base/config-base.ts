/**
 * @author: Leonid Vinikov <leonidvinikov@gmail.com>
 */
import { RollupOptions} from "rollup";

import { IZenToolkitConfig } from "../types/toolkit";

import { getConfig, setToolkitConfig } from "../core/toolkit";

import E_ERROR_CODES from "../errors/codes";

import * as fs from "fs";
import * as path from "path";

export abstract class ConfigBase {
    private rollupConfig: RollupOptions[] = [];

    private toolkitConfig: IZenToolkitConfig = {} as IZenToolkitConfig;

    public async loadConfig() {
        const toolkitPath = path.join( process.cwd(), `rollup.toolkit.ts` );

        // Check if target `rollup.toolkit.ts` exists.
        if ( ! fs.existsSync( toolkitPath ) ) {
            console.error( "'rollup.toolkit.ts' file not found" );
            process.exit( E_ERROR_CODES.TOOLKIT_CONFIG_FILE_NOT_FOUND );
        }

        // If it's not development its also not module, its required to compile `rollup.toolkit.config`.
        if ( ! process.env.development ) {
            const ts = require( "typescript" ),
                JSSourceCode = ts.transpile( fs.readFileSync( toolkitPath, "utf8" ), {
                    target: ts.ScriptTarget.ES5,
                    module: ts.ModuleKind.CommonJS
                } ),
                tempPath = '/tmp/' + ( Math.random() + 1 ).toString( 36 ).substring( 7 ) + '.js';

            fs.writeFileSync( tempPath, JSSourceCode );

            this.toolkitConfig = require( tempPath ).default;
        } else {
            // Load the file.
            this.toolkitConfig = ( await import( toolkitPath ) ).default;
        }

        // Pass the config to the toolkit core.
        setToolkitConfig( this.toolkitConfig );

        // Get rollup config.
        this.rollupConfig = this.getConfigForEachFormat( this.toolkitConfig );
    }

    protected getRollupConfig() {
        return this.rollupConfig;
    }

    private getConfigForEachFormat( config = this.toolkitConfig ) {
        return config.format.map( format => getConfig( {
            ...config,
            format
        } ) );
    }

    protected abstract run(): Promise<void>;
}

export default ConfigBase;
