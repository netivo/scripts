const { sync: spawn } = require( 'cross-spawn' );
const { sync: resolveBin } = require( 'resolve-bin' );
const path = require('path');

const { status } = spawn(
    resolveBin( 'gulp' ),
    [
        '--gulpfile',
        path.join( path.dirname( __dirname ), 'config', `gulpfile.build.js` ),
        '--cwd',
        process.cwd(),
        'compile'
    ],
    { stdio: 'inherit' }
);
process.exit( status );