/**
 * @author: Leonid Vinikov <leonidvinikov@gmail.com>
 */
import { OutputOptions } from "rollup";

import ConfigBase from "../base/config-base";

export default class Build extends ConfigBase {
    public async run() {
        const rollup = await import( 'rollup' ),
            rollupConfig = this.getRollupConfig();

        for ( const config of rollupConfig ) {
            const output = config.output as OutputOptions;

            if ( ! output ) {
                throw new Error( 'Rollup output not found.' );
            }

            const bundle = await rollup.rollup( config ),
                startTime = Date.now();

            console.log( `Writing - '${ output.format }' bundle to '${ output.file }'` );

            await bundle.write( output );

            console.log( `Writing - Done '${ output.format }' bundle to '${ output.file }' in ${ Date.now() - startTime }ms` );

            // Do show dashes for the last bundle.
            if ( config !== rollupConfig[ rollupConfig.length - 1 ] ) {
                console.log( `----------------------------------------` );
            }
        }
    }
}
