const fs = require("fs");
const path = require("path");
const convert = require("convert-source-map");
const sass = require("sass");
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

const helpers = require('./helpers');

const getResultPath = (file, type, blockName = null) => {
    if(type === 'front') {
        return path.resolve(process.cwd(), 'dist', file)
    }
    if(type === 'block') {
        let outputPath = helpers.getGutenbergOutputPath();
        if(!fs.existsSync(path.resolve(outputPath, blockName))){
            fs.mkdirSync(path.resolve(outputPath, blockName), {recursive: true});
        }
        return path.resolve(outputPath, blockName, file)
    }
}

const createMap = (mapData, mapFile, type, cssFile = null, blockName = null) => {
    return new Promise((resolve, reject) => {
        let map = convert.fromObject(mapData);
        if(cssFile !== null) map.setProperty('file', cssFile);
        let src = map.getProperty('sources');
        src = src.map(s => s.replace('file://'+process.cwd(), './..'));
        map.setProperty('sources', src);
        fs.writeFileSync(getResultPath(mapFile, type, blockName), map.toJSON(), {flag: 'w'});
        if(cssFile !== null) fs.writeFileSync(getResultPath(cssFile, type, blockName), convert.generateMapFileComment(mapFile, {multiline: true}), {flag: 'a'});
        resolve({mapFile: mapFile, cssFile: cssFile});
    });
}

const compileCss = (source, destination, type, blockName = null) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
            fs.mkdirSync(path.resolve(process.cwd(), 'dist'));
        }
        const sassResult = sass.compile(source, {
            style: 'expanded',
            loadPaths: [path.resolve(process.cwd(), 'sources'), path.resolve(process.cwd(), 'node_modules')],
            sourceMap: true,
            sourceMapIncludeSources: true
        });
        postcss([autoprefixer()]).process(sassResult.css).then(result => {
            fs.writeFileSync(getResultPath(destination, type, blockName), result.css, {flag: 'w'});
            resolve({sourceMap: sassResult.sourceMap, file: destination, warnings: result.warnings(), css: result.css});
        })
    });
}

const minimizeCss = (css, destination, type, blockName = null) => {
    return new Promise((resolve, reject) => {
        if(!fs.existsSync(path.resolve(process.cwd(), 'dist'))){
            fs.mkdirSync(path.resolve(process.cwd(), 'dist'));
        }
        postcss([cssnano({preset: 'default'})]).process(css).then(r => {
            fs.writeFileSync(getResultPath(destination, type, blockName), r.css, {flag: 'w'});
            resolve({file: destination});
        });
    });
}

const compileGutenbergCss = (file, destination, blockName) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
            fs.mkdirSync(path.resolve(process.cwd(), 'dist'));
        }
        const sassResult = sass.compile(file, {
            style: 'expanded',
            loadPaths: [path.resolve(process.cwd(), 'sources', 'gutenberg', blockName, 'front', 'style'), path.resolve(process.cwd(), 'node_modules')],
            sourceMap: true,
            sourceMapIncludeSources: true
        });
        postcss([autoprefixer()]).process(sassResult.css).then(result => {
            if(!fs.existsSync(destination)){
                fs.mkdirSync(destination, {recursive: true});
            }
            fs.writeFileSync(path.join(destination, blockName + '.css'), result.css, {flag: 'w'});
            resolve({sourceMap: sassResult.sourceMap, file: destination, warnings: result.warnings(), css: result.css});
        })
    });
}

module.exports = {
    createMap: createMap,
    compileCss: compileCss,
    minimizeCss: minimizeCss
}