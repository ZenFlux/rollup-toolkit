/**
 * @author: Leonid Vinikov <leonidvinikov@gmail.com>
 */
import { RollupOptions} from "rollup";

import { IZenFluxRollupConfig } from "../types/toolkit";

import { getConfig } from "../core/toolkit";

import E_ERROR_CODES from "../errors/codes";

import * as fs from "fs";
import * as path from "path";

export abstract class ConfigBase {
    private rollupConfig: RollupOptions[] = [];

    private toolkitConfig!: IZenFluxRollupConfig;

    public async loadConfig() {
        const toolkitPath = path.join( process.cwd(), `rollup.toolkit.ts` );

        // Check if target `rollup.toolkit.ts` exists.
        if ( ! fs.existsSync( toolkitPath ) ) {
            console.error( `File not found: ${ toolkitPath }` );
            process.exit( E_ERROR_CODES.FILE_NOT_FOUND );
        }

        // If it's not development its also not module, so its required to compile `rollup.toolkit.config`.
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

        // Get global config.
        this.rollupConfig = this.getGlobalConfig( this.toolkitConfig );
    }

    protected getConfig() {
        return this.rollupConfig;
    }

    private getGlobalConfig( config = this.toolkitConfig ) {
        return config.format.map( format => getConfig( {
            ...config,
            format
        } ) );
    }

    protected abstract run(): Promise<void>;
}

export default ConfigBase;
