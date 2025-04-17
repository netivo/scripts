const webpack = require("webpack");
const helpers = require('./helpers');
const webpackConfig = require("../config/webpack-gutenberg.build");
const css = require("./css");
const glog = require("fancy-log");
const fs = require("fs");
const path = require("path");
const sass = require("sass");
const autoprefixer = require("autoprefixer");

const webpackBuild = (entries, mode) => {
    return new Promise((resolve, reject) => {
        const webpackConfig = require("../config/webpack-gutenberg.build");
        webpackConfig['entry'] = entries;
        webpackConfig['mode'] = mode;
        webpack(webpackConfig, (err, stats) => {
            if(err) {
                reject(err);
            }
            else {
                resolve(stats);
            }
        });
    });
}
const compileCss = (entry, resultFiles, blockName, mode) => {
    const start = performance.now();
    return new Promise((resolve, reject) => {
        css.compileCss(entry, resultFiles.cssFile, 'block', blockName).then(result => {
            result.warnings.forEach(warning => {
                glog.warn(warning.toString());
            });
            css.createMap(result.sourceMap, resultFiles.mapFile, 'block', resultFiles.cssFile, blockName).then(mapResult => {
                if (mode === 'development') {
                    const stop = performance.now();
                    const inSeconds = (stop - start) / 1000;
                    const rounded = Number(inSeconds).toFixed(3);

                    resolve(rounded);
                } else {
                    css.minimizeCss(result.css, resultFiles.minFile, 'block', blockName).then(minResult => {
                        const stop = performance.now();
                        const inSeconds = (stop - start) / 1000;
                        const rounded = Number(inSeconds).toFixed(3);

                        resolve(rounded);
                    })
                }
            });
        }).catch(error => {
            reject(error.toString());
        });
    });
}
const developBlock = (file = null, mode = 'development') => {
    let entries = false;
    if(file !== null) {
        entries = helpers.parseGutenbergBlockEntry(file);
    } else {
        entries = helpers.getGutenbergEntries()
    }
    if(entries !== false) {
        return webpackBuild(entries, mode)
    } else {
        throw new Error('No file to compile');
    }
};
const developBlockFrontScript = (file = null, mode = 'development') => {
    let entries = false;
    if(file !== null) {
        entries = helpers.parseGutenbergBlockFrontEntry(file);
    } else {
        entries = helpers.getGutenbergFrontEntries()
    }
    if(entries !== false) {
        return webpackBuild(entries, mode)
    } else {
        if(mode === 'development') {
            throw new Error('No file to compile');
        } else {
            return new Promise(resolve => resolve());
        }
    }
}
const developBlockCss = (file, mode = 'development') => {
    let entry = helpers.parseGutenbergBlockStyleEntry(file);
    if(entry  !== false) {
        const blockName = helpers.getBlockNameFromFile(entry);
        const resultFiles = helpers.getCssFileNames(entry, 'block', blockName);
        return compileCss(entry, resultFiles, blockName, mode);
    } else {
        if(mode === 'development') {
            throw new Error('No file to compile');
        } else {
            return new Promise(resolve => resolve());
        }
    }
}
const developBlockFrontStyle = (file, mode = 'development') => {
    let entry = helpers.parseGutenbergBlockFrontStyleEntry(file);
    if(entry  !== false) {
        const blockName = helpers.getBlockNameFromFile(entry);
        const resultFiles = helpers.getCssFileNames(entry, 'block-front', blockName);
        return compileCss(entry, resultFiles, blockName, mode);
    } else {
        if(mode === 'development') {
            throw new Error('No file to compile');
        } else {
            return new Promise(resolve => resolve());
        }
    }
}
const prepareJsonFile = (file = null, mode = 'development') => {
    let entries = false;
    if(file !== null) {
        entries = [ file ];
    } else {
        entries = helpers.getGutenbergJsonFiles();
    }
    entries.forEach(entry => {
        const blockName = helpers.getBlockNameFromFile(entry);
        const outputPath = helpers.getGutenbergOutputPath();

        if(blockName === false) return false;

        const name = path.join(outputPath, blockName, 'block.json');

        let blockJson = fs.readFileSync(entry);
        blockJson = JSON.parse(blockJson);

        blockJson.editorScript = 'file:./block.js';
        if(mode === 'development') {
            if (fs.existsSync(path.join(outputPath, blockName, 'block.css'))) {
                blockJson.editorStyle = 'file:./block.css';
            }
            if (fs.existsSync(path.join(outputPath, blockName, blockName + '.css'))) {
                blockJson.style = 'file:./' + blockName + '.css';
            }
        } else {
            if (fs.existsSync(path.join(outputPath, blockName, 'block.min.css'))) {
                blockJson.editorStyle = 'file:./block.min.css';
            }
            if (fs.existsSync(path.join(outputPath, blockName, blockName + '.min.css'))) {
                blockJson.style = 'file:./' + blockName + '.min.css';
            }
        }
        if(fs.existsSync(path.join(outputPath, blockName, blockName + '.js'))) {
            blockJson.viewScript = 'file:./' + blockName + '.js';
        }
        let json_string = JSON.stringify(blockJson, null, 2);
        fs.writeFileSync(name, json_string);

        glog('Prepared block.json file for block ' + blockName);
    });
}
const movePhpFile = (file = null) => {
    let entries = false;
    if(file !== null) {
        entries = [ file ];
    } else {
        entries = helpers.getGutenbergJsonFiles();
    }
    entries.forEach(entry => {
        const blockName = helpers.getBlockNameFromFile(entry);
        const outputPath = helpers.getGutenbergOutputPath();

        if(blockName === false) return false;

        const name = path.join(outputPath, blockName, 'render.php');

        fs.copyFileSync(entry, name);
        glog('Moved php render file for block ' + blockName);
    });
}

const compileBlock = (blockName) => {
    glog('Compile block ' + blockName);
    const sourcePath = path.resolve(process.cwd(), 'sources', 'gutenberg');
    const blockJS = path.join(sourcePath, blockName, 'admin', 'index.js');
    const blockCss = path.join(sourcePath, blockName, 'admin', 'index.scss');
    const blockFrontJs = path.join(sourcePath, blockName, 'front', 'script', 'index.js');
    const blockFrontCss = path.join(sourcePath, blockName, 'front', 'style', 'index.scss');
    const blockJson = path.join(sourcePath, blockName, 'block.json');
    const blockRender = path.join(sourcePath, blockName, 'render.php');
    if(fs.existsSync(blockJS)) {
        developBlock(blockJS, 'production').then(() => {
            Promise.all([developBlockCss(blockCss, 'production'), developBlockFrontScript(blockFrontJs, 'production'), developBlockFrontStyle(blockFrontCss, 'production')]).then(() => {
                prepareJsonFile(blockJson, 'production');
                if(fs.existsSync(blockRender)) {
                    movePhpFile(blockRender);
                }
                glog('Done');
            }).catch(error => {
                console.log(error);
            });
        });
    }
    return false;
}

const compileBlocks = () => {
    const blocks = helpers.getGutenbergBlocks();
    blocks.forEach(block => {
        compileBlock(block);
    });
}

module.exports = {
    developBlock: developBlock,
    developBlockCss: developBlockCss,
    developBlockFrontScript: developBlockFrontScript,
    developBlockFrontStyle: developBlockFrontStyle,
    movePhpFile: movePhpFile,
    prepareJsonFile: prepareJsonFile,
    compileBlocks: compileBlocks
};
