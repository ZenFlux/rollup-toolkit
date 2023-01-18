/**
 * @author: Leonid Vinikov <leonidvinikov@gmail.com>
 */
import Watch from "./runners/watch";
import Build from "./runners/build";

export default async function boot() {
    const args = process.argv.slice( 2 );

    let shouldWatch = false;

    // noinspection FallThroughInSwitchStatementJS
    switch ( args[ 0 ] ) {
        case '@watch':
            shouldWatch = true;
        case '@build':
            const builder = shouldWatch ? new Watch() : new Build();

            await builder.loadConfig();
            await builder.run();

            break;
    }
}

export * from './types/toolkit';
