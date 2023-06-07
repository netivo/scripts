const path = require("path");
const glog = require('fancy-log');
const watch = require('glob-watcher');

const helpers = require('./../scripts/helpers');
const css = require('./../scripts/css');
const javascript = require('./../scripts/javascript');


const developCSS = () => {
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
                                const stop = performance.now();
                                const inSeconds = (stop - start) / 1000;
                                const rounded = Number(inSeconds).toFixed(3);

                                glog('Finished in ' + rounded + 's.');
                        });
                });
        });
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

const fileChange = (file, stat) => {
        glog('Change detected: ' + file);
        const sassPath = path.resolve(process.cwd(), 'sources', 'sass');
        const jsPath = path.resolve(process.cwd(), 'sources', 'javascript');
        const gutenPath = path.resolve(process.cwd(), 'sources', 'gutenberg');
        if(file.startsWith(sassPath)) developCSS();
        else if(file.startsWith(jsPath) || file.startsWith(gutenPath)) developJs();
}

watcher.on('change', fileChange);
watcher.on('add', fileChange);
watcher.on('unlink', fileChange);
