const path = require("path");
const watch = require('glob-watcher');

const helpers = require('./../scripts/helpers');
const css = require('./../scripts/css');
const javascript = require('./../scripts/javascript');
const gutenberg = require('../scripts/gutenberg');
const lint = require('../scripts/lint.mjs');
const log = require("../scripts/log");

let actionRunning = false;

const developCSS = (file = null) => {
        if(actionRunning === false) {
                actionRunning = true;
                log.default.log('Running linter');
                lint.default.lintCssFix(file).then(result => {
                        console.log(result.report);
                        log.default.log('Done');
                        const sassFiles = helpers.getSassFiles();
                        sassFiles.forEach(file => {
                                const resultFiles = helpers.getCssFileNames(file);
                                const start = performance.now();
                                log.default.log('SASS compiling entry: ' + resultFiles.entryName);
                                css.compileCss(file, resultFiles.cssFile, 'front').then(result => {
                                        result.warnings.forEach(warning => {
                                                log.default.log_warning(warning.toString());
                                        });
                                        css.createMap(result.sourceMap, resultFiles.mapFile, resultFiles.cssFile).then(mapResult => {
                                                const stop = performance.now();
                                                const inSeconds = (stop - start) / 1000;
                                                const rounded = Number(inSeconds).toFixed(3);

                                                log.default.log('Finished in ' + rounded + 's.');
                                                actionRunning = false;
                                        });
                                }).catch(error => {
                                        log.default.log_error(error.toString());
                                        actionRunning = false;
                                });
                        });
                }).catch(error => {
                        log.default.log_error(error.toString());
                        actionRunning = false;
                });
        }
}
const developJs = (file = null) => {
        if(actionRunning === false) {
                actionRunning = true;
                log.default.log('Running linter');
                lint.default.lintJsFix(file).then(res => {
                        log.default.log('Done');
                        log.default.log('Javascript compiling');
                        javascript.develop().then(result => {
                                log.default.log(result.toString())
                                actionRunning = false;
                        }).catch(error => {
                                log.default.log_error(error.toString());
                                actionRunning = false;
                        });
                }).catch(error => {
                        log.default.log_error(error.toString());
                        actionRunning = false;
                });
        }
}

log.default.log('Watchig scss ...');
log.default.log('Watchig js ...');

const watcher = watch([path.resolve(process.cwd(), 'sources', '**', '*.*').replace(/\\/g, '/')]);

const developGutenberg = (file) => {
        let type = helpers.getBlockFileType(file);
        let blockName = helpers.getBlockNameFromFile(file);
        if(type === 'block') {
                gutenberg.developBlock(file).then(result => {
                        log.default.log(result.toString())
                }).catch(error => {
                        log.default.log_error(error.toString());
                });
        } else if( type === 'block-style') {
                log.default.log('Compiling block ' + blockName + ' editor style');
                gutenberg.developBlockCss(file).then(result => {
                        log.default.log('Finished in ' + result + 's.');
                }).catch(error => {
                        log.default.log_error(error.toString());
                });
        } else if( type === 'front-script') {
                gutenberg.developBlockFrontScript(file).then(result => {
                        log.default.log(result.toString())
                }).catch(error => {
                        log.default.log_error(error.toString());
                });
        } else if( type === 'front-style') {
                log.default.log('Compiling block ' + blockName + ' view style');
                gutenberg.developBlockFrontStyle(file).then(result => {
                        log.default.log('Finished in ' + result + 's.');
                }).catch(error => {
                        log.default.log_error(error.toString());
                });
        } else if( type === 'php') {
                gutenberg.movePhpFile(file);
        } else if( type === 'json') {
                gutenberg.prepareJsonFile(file);
        }
}

const fileChange = (file, stat) => {
        log.default.log('Change detected: ' + file);
        const sassPath = path.resolve(process.cwd(), 'sources', 'sass');
        const jsPath = path.resolve(process.cwd(), 'sources', 'javascript');
        const gutenPath = path.resolve(process.cwd(), 'sources', 'gutenberg');
        if(file.startsWith(sassPath)) developCSS(file);
        else if(file.startsWith(jsPath)) developJs(file);
        else if(file.startsWith(gutenPath)){
                developGutenberg(file);
        }
}

watcher.on('change', fileChange);
watcher.on('add', fileChange);
watcher.on('unlink', fileChange);
