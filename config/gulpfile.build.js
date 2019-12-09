const gulp = require("gulp");
const sassParser = require("gulp-sass");
const rename = require("gulp-rename");
const minifyCss = require("gulp-clean-css");
const packageImporter = require("node-sass-package-importer");
const path = require('path');
const glog = require('fancy-log');
const pluginError = require('plugin-error');
const webpack = require('webpack');

const webpackConfig = require('./webpack.build');

let name = process.env.npm_package_name;

console.log(process.cwd());

const compileSASS = () => {
    return gulp.src(path.resolve(process.cwd(), 'sources', 'sass', 'main.scss'))
        .pipe(sassParser({includePaths: [path.resolve(process.cwd(), 'sources', 'sass')], importer: packageImporter()}))
        .pipe(rename(name + '.css'))
        .pipe(gulp.dest(path.resolve(process.cwd(), 'dist')))
        .pipe(rename(name + '.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest(path.resolve(process.cwd(), 'dist')));
};

const webpackRun = (done) => {
    webpack(webpackConfig, (err, stats) => {
        if(err) {
            throw new pluginError("webpack", err);
        }
        else {
            glog("[webpack]", stats.toString());
        }
        done();
    });
};

module.exports = {
    compile: gulp.parallel(compileSASS, webpackRun)
};