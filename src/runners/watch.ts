/**
 * @author: Leonid Vinikov <leonidvinikov@gmail.com>
 */
import { OutputOptions, RollupWatchOptions } from "rollup";

import ConfigBase from "../base/config-base";

import E_ERROR_CODES from "../errors/codes";

export default class Watch extends ConfigBase {
    public async run() {
        const rollup = await import( 'rollup' );

        for ( const config of this.getConfig() ) {
            const output = config.output as OutputOptions;

            if ( ! output ) {
                console.error( `output not found: ${ JSON.stringify( config ) }` );
                process.exit( E_ERROR_CODES.OUTPUT_NOT_FOUND );
            }

            const watchOptions = { ...config } as RollupWatchOptions;

            watchOptions.watch = {
                clearScreen: true,
            };

            const watcher = rollup.watch( watchOptions );

            let startTime = 0;

            watcher.on( 'event', function ( evt ) {
                switch ( evt.code ) {
                    case 'BUNDLE_START':
                        startTime = Date.now();
                        console.log( `Watching - Start '${ output.format }' bundle to '${ output.file }'` );
                        break;

                    case 'BUNDLE_END':
                        console.log( `Watching - Done '${ output.format }' bundle to '${ output.file }'`+
                            'in ' + ( Date.now() - startTime ) + 'ms');
                        break;

                    case 'ERROR':
                        console.log( `Error - When processing: ${ output.file }` );
                        console.log( "\t" + evt.error );
                        break;
                }
            } );
        }
    }
}
