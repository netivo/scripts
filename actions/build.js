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

const projectName = (typeof process.env.npm_package_name !== 'undefined' &&process.env.npm_package_name !== '') ? process.env.npm_package_name : 'name';

const webpackConfig = require('./../config/webpack.build');
const cssnano = require("cssnano");

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

const buildCSS = () => {
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
                        postcss([cssnano({preset: 'default'})]).process(res.css).then(r => {
                                fs.writeFileSync(path.resolve(process.cwd(), 'dist', finalFile.replace('.css', '.min.css')), r.css, {flag: 'w'});

                                const stop = performance.now();
                                const inSeconds = (stop - start) / 1000;
                                const rounded = Number(inSeconds).toFixed(3);

                                glog('Finished in ' + rounded + 's.');
                        });
                })
        });
        // done();
}

const webpackRunBuild = () => {
        webpackConfig['mode'] = 'production';
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

buildCSS();
webpackRunBuild();
