const glog = require('fancy-log');

const helpers = require('./../scripts/helpers');
const css = require('./../scripts/css');
const javascript = require('./../scripts/javascript');
const gutenberg = require('./../scripts/gutenberg');


const compileCSS = () => {
        const sassFiles = helpers.getSassFiles();
        sassFiles.forEach(file => {
                const resultFiles = helpers.getCssFileNames(file);
                const start = performance.now();
                glog('SASS compiling entry: ' + resultFiles.entryName);
                css.compileCss(file, resultFiles.cssFile).then(result => {
                        result.warnings.forEach(warning => {
                                glog.warn(warning.toString());
                        });
                        css.createMap(result.sourceMap, resultFiles.mapFile, resultFiles.cssFile).then(mapResult => {
                                css.minimizeCss(result.css, resultFiles.minFile).then(minResult => {
                                        const stop = performance.now();
                                        const inSeconds = (stop - start) / 1000;
                                        const rounded = Number(inSeconds).toFixed(3);

                                        glog('Finished in ' + rounded + 's.');
                                })
                        });
                });
        });
}

const compileGutenberg = () => {
        gutenberg.compileBlocks();
}
const compileJs = () => {
        glog('Javascript compiling');
        javascript.compile().then(result => {
                glog(result.toString())
        }).catch(error => {
                glog.error(error.toString());
        });
}

compileCSS();
compileJs();
compileGutenberg();