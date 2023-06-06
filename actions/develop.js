const path = require('path');
const sass = require('sass');
const glob = require("glob");
const fs = require("fs");
const Path = require("path");
const watch = require('glob-watcher');
const webpack = require('webpack');
const glog = require('fancy-log');
const pluginError = require('plugin-error');
const convert = require('convert-source-map');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const cssnano = require('cssnano');

const projectName = (typeof process.env.npm_package_name !== 'undefined' &&process.env.npm_package_name !== '') ? process.env.npm_package_name : 'name';

const webpackConfig = require('./../config/webpack.build');

const parsePath = (path) => {
        var extname = Path.extname(path);
        return {
                dirname: Path.dirname(path),
                basename: Path.basename(path, extname),
                extname: extname
        };
}

const createCssMap = (sourceMap, cssFile) => {
        let map = convert.fromObject(sourceMap);
        map.setProperty('file', cssFile);
        let src = map.getProperty('sources');
        src = src.map(s => s.replace('file://'+process.cwd(), './..'));
        map.setProperty('sources', src);
        fs.writeFileSync(path.resolve(process.cwd(), 'dist', cssFile+'.map'), map.toJSON(), {flag: 'w'});
        fs.writeFileSync(path.resolve(process.cwd(), 'dist', cssFile), convert.generateMapFileComment(cssFile+'.map', {multiline: true}), {flag: 'a'});
}

const developCSS = () => {
        const sassPath = path.resolve(process.cwd(), 'sources', 'sass', 'entries', '**.scss')
        const sassFiles = glob.sync(sassPath);

        sassFiles.forEach(file => {
                const filePath = parsePath(file);
                glog('SASS Compiling entry: ' + filePath.basename);
                const start = performance.now();
                let finalFile = projectName;
                if (filePath.basename !== 'index' && filePath.basename !== 'main') finalFile += '-' + filePath.basename;
                finalFile += '.css';
                const result = sass.compile(file, {
                        style: 'expanded',
                        loadPaths: [path.resolve(process.cwd(), 'sources', 'sass'), path.resolve(process.cwd(), 'node_modules')],
                        sourceMap: true,
                        sourceMapIncludeSources: true
                });
                postcss([ autoprefixer() ]).process(result.css).then(res => {
                        res.warnings().forEach(warn => {
                                console.warn(warn.toString())
                        })
                        fs.writeFileSync(path.resolve(process.cwd(), 'dist', finalFile), res.css, {flag: 'w'});
                        createCssMap(result.sourceMap, finalFile);

                        const stop = performance.now();
                        const inSeconds = (stop - start) / 1000;
                        const rounded = Number(inSeconds).toFixed(3);

                        glog('Finished in ' + rounded + 's.');
                })
        });
        // done();
}

const webpackRunDevelop = () => {
        webpackConfig['mode'] = 'development';
        webpack(webpackConfig, (err, stats) => {
                if(err) {
                        throw new pluginError("webpack", err);
                }
                else {
                        glog("[webpack]", stats.toString());
                }
                // done();
        });
};

glog('Watchig scss ...');
glog('Watchig js ...');

const watcher = watch([
        path.resolve(process.cwd(), 'sources', 'sass', '**', '*.sass').replace(/\\/g, '/'),
        path.resolve(process.cwd(), 'sources', 'sass', '**', '*.scss').replace(/\\/g, '/'),
        path.resolve(process.cwd(), 'sources', 'javascript', '**', '*.js').replace(/\\/g, '/'),
        path.resolve(process.cwd(), 'sources', 'gutenberg', '**', '*.js').replace(/\\/g, '/')
]);

watcher.on('change', (file, stat) => {
        glog('Change detected: ' + file);
        const sassPath = path.resolve(process.cwd(), 'sources', 'sass');
        const jsPath = path.resolve(process.cwd(), 'sources', 'javascript');
        const gutenPath = path.resolve(process.cwd(), 'sources', 'gutenberg');
        if(file.startsWith(sassPath)) developCSS();
        else if(file.startsWith(jsPath) || file.dirname.startsWith(gutenPath)) webpackRunDevelop();
});
