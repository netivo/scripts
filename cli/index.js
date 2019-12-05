#!/usr/bin/env node

const spawn = require('cross-spawn');
const path = require('path');
const { existsSync } = require('fs');

const [actionName, ...args] = process.argv.slice( 2 );

const fromRoot = ( actionName ) => path.join( path.dirname( __dirname ), 'actions', `${ actionName }.js` );
const hasActionFile = ( actionName ) => existsSync( fromRoot( actionName ) );

if(typeof actionName !== "undefined") {
    if (hasActionFile(actionName)) {
        spawn.sync(
            'node',
            [
                fromRoot(actionName),
                ...args
            ],
            {stdio: 'inherit'}
        )
    } else {
        console.log('There is no action file for ' + actionName + '.');
    }
} else {
    if(hasActionFile('build')){
        spawn.sync(
            'node',
            [
                fromRoot('build'),
                ...args
            ],
            {stdio: 'inherit'}
        )
    } else {
        console.log('There is no action file for building.');
    }
}

