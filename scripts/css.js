const fs = require("fs");
const path = require("path");
const convert = require("convert-source-map");
const sass = require("sass");
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

const createMap = (mapData, mapFile, cssFile = null) => {
    return new Promise((resolve, reject) => {
        let map = convert.fromObject(mapData);
        if(cssFile !== null) map.setProperty('file', cssFile);
        let src = map.getProperty('sources');
        src = src.map(s => s.replace('file://'+process.cwd(), './..'));
        map.setProperty('sources', src);
        fs.writeFileSync(path.resolve(process.cwd(), 'dist', mapFile), map.toJSON(), {flag: 'w'});
        if(cssFile !== null) fs.writeFileSync(path.resolve(process.cwd(), 'dist', cssFile), convert.generateMapFileComment(mapFile, {multiline: true}), {flag: 'a'});
        resolve({mapFile: mapFile, cssFile: cssFile});
    });
}

const compileCss = (source, destination) => {
    return new Promise((resolve, reject) => {
        if(!fs.existsSync(path.resolve(process.cwd(), 'dist'))){
            fs.mkdirSync(path.resolve(process.cwd(), 'dist'));
        }
        const sassResult = sass.compile(source, {
            style: 'expanded',
            loadPaths: [path.resolve(process.cwd(), 'sources', 'sass'), path.resolve(process.cwd(), 'node_modules')],
            sourceMap: true,
            sourceMapIncludeSources: true
        });
        postcss([autoprefixer()]).process(sassResult.css).then(result => {
            fs.writeFileSync(path.resolve(process.cwd(), 'dist', destination), result.css, {flag: 'w'});
            resolve({sourceMap: sassResult.sourceMap, file: destination, warnings: result.warnings(), css: result.css});
        })
    });
}

const minimizeCss = (css, destination) => {
    return new Promise((resolve, reject) => {
        if(!fs.existsSync(path.resolve(process.cwd(), 'dist'))){
            fs.mkdirSync(path.resolve(process.cwd(), 'dist'));
        }
        postcss([cssnano({preset: 'default'})]).process(css).then(r => {
            fs.writeFileSync(path.resolve(process.cwd(), 'dist', destination), r.css, {flag: 'w'});
            resolve({file: destination});
        });
    });
}

module.exports = {
    createMap: createMap,
    compileCss: compileCss,
    minimizeCss: minimizeCss
}