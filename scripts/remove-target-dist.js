const shx = require( 'shelljs' );
const target = process.cwd() + '/dist';

shx.rm( '-rf', target );

