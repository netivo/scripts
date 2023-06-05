const gulp = require("gulp");
const sassParser = require("gulp-sass")(require('sass'));
const rename = require("gulp-rename");
const minifyCss = require("gulp-clean-css");
const postCss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const path = require('path');
const glog = require('fancy-log');
const pluginError = require('plugin-error');
const webpack = require('webpack');
const sourcemaps = require("gulp-sourcemaps");

const webpackConfig = require('./webpack.build');

let name = process.env.npm_package_name;

const compileSASS = () => {
    return gulp.src(path.resolve(process.cwd(), 'sources', 'sass', 'entries', '**.scss'))
        .pipe(sassParser({includePaths: [path.resolve(process.cwd(), 'sources', 'sass'), path.resolve(process.cwd(), 'node_modules')]}))
        .pipe(postCss([autoprefixer]))
        .pipe(rename(function(path) {
            let basename = path.basename;
            if (basename === 'main' || basename === 'index') basename = '';
            else basename = '-' + basename;
            return {
                dirname: path.dirname,
                basename: name + basename,
                extname: ".css"
            }
        }))
        .pipe(gulp.dest(path.resolve(process.cwd(), 'dist')))
        .pipe(rename(function(path) {
            let basename = path.basename;
            if (basename === 'main' || basename === 'index') basename = '';
            else basename = '-' + basename;
            return {
                dirname: path.dirname,
                basename: name + basename,
                extname: ".min.css"
            }
        }))
        .pipe(minifyCss())
        .pipe(gulp.dest(path.resolve(process.cwd(), 'dist')));
};
const developSASS = () => {
    return gulp.src(path.resolve(process.cwd(), 'sources', 'sass', 'entries', '**.scss'))
        .pipe(sourcemaps.init())
        .pipe(sassParser({includePaths: [path.resolve(process.cwd(), 'sources', 'sass'), path.resolve(process.cwd(), 'node_modules')]}))
        .pipe(postCss([autoprefixer]))
        .pipe(rename(function(path){
            let basename = path.basename;
            if(basename === 'main' || basename === 'index') basename = '';
            else basename = '-' + basename;
            return {
                dirname: path.dirname,
                basename: name + basename,
                extname: ".css"
            }
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path.resolve(process.cwd(), 'dist')));
};
const watchSASS = () => {
    return gulp.watch([path.resolve(process.cwd(), 'sources', 'sass', '**', '*.sass').replace(/\\/g, '/'), path.resolve(process.cwd(), 'sources', 'sass', '**', '*.scss').replace(/\\/g, '/')], developSASS)
};

const webpackRun = (done) => {
    webpackConfig['mode'] = 'production';
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
const webpackRunDevelop = (done) => {
    webpackConfig['mode'] = 'development';
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

const watchJS = () => {
    return gulp.watch([path.resolve(process.cwd(), 'sources', 'javascript', '**', '*.js').replace(/\\/g, '/'), path.resolve(process.cwd(), 'sources', 'gutenberg', '**', '*.js').replace(/\\/g, '/')], webpackRunDevelop)
}

module.exports = {
    compile: gulp.parallel(compileSASS, webpackRun),
    develop: gulp.parallel(watchSASS, watchJS)
};