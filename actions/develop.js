const path = require("path");
const glog = require('fancy-log');
const watch = require('glob-watcher');

const helpers = require('./../scripts/helpers');
const css = require('./../scripts/css');
const javascript = require('./../scripts/javascript');
const gutenberg = require('../scripts/gutenberg');
const lint = require('../scripts/lint.mjs');

let actionRunning = false;

const developCSS = () => {
        if(actionRunning === false) {
                actionRunning = true;
                lint.default.lintCssFix().then(result => {
                        console.log(result.report);
                        const sassFiles = helpers.getSassFiles();
                        sassFiles.forEach(file => {
                                const resultFiles = helpers.getCssFileNames(file);
                                const start = performance.now();
                                glog('SASS compiling entry: ' + resultFiles.entryName);
                                css.compileCss(file, resultFiles.cssFile, 'front').then(result => {
                                        result.warnings.forEach(warning => {
                                                glog.warn(warning.toString());
                                        });
                                        css.createMap(result.sourceMap, resultFiles.mapFile, resultFiles.cssFile).then(mapResult => {
                                                const stop = performance.now();
                                                const inSeconds = (stop - start) / 1000;
                                                const rounded = Number(inSeconds).toFixed(3);

                                                glog('Finished in ' + rounded + 's.');
                                                actionRunning = false;
                                        });
                                }).catch(error => {
                                        glog.error(error.toString());
                                        actionRunning = false;
                                });
                        });
                });
        }
}
const developJs = () => {
        glog('Javascript compiling');
        javascript.develop().then(result => {
                glog(result.toString())
        }).catch(error => {
                glog.error(error.toString());
        });
}

glog('Watchig scss ...');
glog('Watchig js ...');

const watcher = watch([path.resolve(process.cwd(), 'sources', '**', '*.*').replace(/\\/g, '/')]);

const developGutenberg = (file) => {
        let type = helpers.getBlockFileType(file);
        let blockName = helpers.getBlockNameFromFile(file);
        if(type === 'block') {
                gutenberg.developBlock(file).then(result => {
                        glog(result.toString())
                }).catch(error => {
                        glog.error(error.toString());
                });
        } else if( type === 'block-style') {
                glog('Compiling block ' + blockName + ' editor style');
                gutenberg.developBlockCss(file).then(result => {
                        glog('Finished in ' + result + 's.');
                }).catch(error => {
                        glog.error(error.toString());
                });
        } else if( type === 'front-script') {
                gutenberg.developBlockFrontScript(file).then(result => {
                        glog(result.toString())
                }).catch(error => {
                        glog.error(error.toString());
                });
        } else if( type === 'front-style') {
                glog('Compiling block ' + blockName + ' view style');
                gutenberg.developBlockFrontStyle(file).then(result => {
                        glog('Finished in ' + result + 's.');
                }).catch(error => {
                        glog.error(error.toString());
                });
        } else if( type === 'php') {
                gutenberg.movePhpFile(file);
        } else if( type === 'json') {
                gutenberg.prepareJsonFile(file);
        }
}

const fileChange = (file, stat) => {
        glog('Change detected: ' + file);
        const sassPath = path.resolve(process.cwd(), 'sources', 'sass');
        const jsPath = path.resolve(process.cwd(), 'sources', 'javascript');
        const gutenPath = path.resolve(process.cwd(), 'sources', 'gutenberg');
        if(file.startsWith(sassPath)) developCSS();
        else if(file.startsWith(jsPath)) developJs();
        else if(file.startsWith(gutenPath)){
                developGutenberg(file);
        }
}

watcher.on('change', fileChange);
watcher.on('add', fileChange);
watcher.on('unlink', fileChange);
