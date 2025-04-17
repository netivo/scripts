const Path = require("path");
const glob = require("glob");
const path = require("path");

const projectName = (typeof process.env.npm_package_name !== 'undefined' &&process.env.npm_package_name !== '') ? process.env.npm_package_name : 'name';

const parsePath = (path) => {
    let extname = Path.extname(path);
    let dirname = Path.dirname(path);

    return {
        dirname: dirname,
        relativeDir: dirname.replace(process.cwd(), '.'),
        basename: Path.basename(path, extname),
        extname: extname
    };
}

const getSassFiles = (type = 'front') => {
    let sassPath = '';
    if (type === 'front') {
        sassPath = Path.resolve(process.cwd(), 'sources', 'sass', 'entries', '**.scss');
    } else if(type === 'block') {
        sassPath = Path.resolve(process.cwd(), 'sources', 'gutenberg', '**', 'admin', '**.scss');
    } else if(type === 'block-front') {
        sassPath = Path.resolve(process.cwd(), 'sources', 'gutenberg', '**', 'front', 'style', '**.scss');
    }
    return glob.sync(sassPath.replace(/\\/g,'/'));
}

const getCssFileNames = (file, type = 'front', blockName = null) => {
    const filePath = parsePath(file);
    let finalFile = '';
    if(type === 'front') {
        finalFile = projectName;
        if (filePath.basename !== 'index' && filePath.basename !== 'main') finalFile += '-' + filePath.basename;
        finalFile += '.css';
    } else if(type === 'block') {
        finalFile = 'block.css'
    } else if(type === 'block-front') {
        finalFile = blockName + '.css'
    }

    return {
        entryName: filePath.basename,
        cssFile: finalFile,
        mapFile: finalFile + '.map',
        minFile: finalFile.replace('.css', '.min.css')
    }
}

const getBlockNameFromFile = (file) => {
    const sourcePath = Path.resolve(process.cwd(), 'sources', 'gutenberg');
    if(!file.startsWith(sourcePath)) return false;
    let filePath = file.replace(sourcePath + Path.sep, '').split(Path.sep);
    return filePath.at(0);
}

const getBlockFileType = (file) => {
    const sourcePath = Path.resolve(process.cwd(), 'sources', 'gutenberg');
    if(!file.startsWith(sourcePath)) return false;

    if(file.indexOf('block.json') !== -1) {
        return 'json';
    }
    if(file.indexOf('render.php') !== -1) {
        return 'php';
    }

    let filePath = file.replace(sourcePath + Path.sep, '').split(Path.sep);
    if(filePath[1] === 'admin') {
        if(file.indexOf(".js") !== -1) {
            return 'block';
        }
        if(file.indexOf(".scss") !== -1) {
            return "block-style";
        }
    }
    if(filePath[1] === 'front') {
        if(filePath[2] === 'script') return 'front-script';
        if(filePath[2] === 'style') return 'front-style';
    }
    return false;
}

const getGutenbergOutputPath = () => {
    let packageData = (typeof process.env.npm_package_json !== 'undefined' && process.env.npm_package_json !== '') ? require(process.env.npm_package_json) : {};
    return  (typeof packageData.gutenberg !== 'undefined' && packageData.gutenberg !== '') ? packageData.gutenberg : path.join('dist','gutenberg');
}

const parseGutenbergBlockEntry = (file) => {
    const sourcePath = Path.resolve(process.cwd(), 'sources', 'gutenberg');
    const outputPath = getGutenbergOutputPath();
    const blockName = getBlockNameFromFile(file);

    if(blockName === false) return false;

    const name = path.join(outputPath, blockName, 'block.js');
    const startFile = path.join(sourcePath, blockName, 'admin', 'index.js');
    let entry = {}
    entry[name] = startFile
    return entry;
}
const parseGutenbergBlockFrontEntry = (file) => {
    const sourcePath = Path.resolve(process.cwd(), 'sources', 'gutenberg');
    const outputPath = getGutenbergOutputPath();
    const blockName = getBlockNameFromFile(file);

    if(blockName === false) return false;

    const name = path.join(outputPath, blockName, blockName + '.js');
    const startFile = path.join(sourcePath, blockName, 'front', 'script', 'index.js');
    let entry = {}
    entry[name] = startFile
    return entry;
}

const parseGutenbergBlockFrontStyleEntry = (file) => {
    const sourcePath = Path.resolve(process.cwd(), 'sources', 'gutenberg');
    const blockName = getBlockNameFromFile(file);

    if(blockName === false) return false;
    return path.join(sourcePath, blockName, 'front', 'style', 'index.scss');
}
const parseGutenbergBlockStyleEntry = (file) => {
    const sourcePath = Path.resolve(process.cwd(), 'sources', 'gutenberg');
    const blockName = getBlockNameFromFile(file);

    if(blockName === false) return false;
    return path.join(sourcePath, blockName, 'admin', 'index.scss');
}

const getGutenbergEntries = () => {
    const sourcePath = Path.resolve(process.cwd(), 'sources', 'gutenberg');
    const blockFiles = glob.sync( (sourcePath+ '/**/admin/index.js').replace(/\\/g,'/'));
    const outputPath = getGutenbergOutputPath();
    let entries = {};
    const blocks = blockFiles.reduce((acc, item) => {
        item = path.resolve(item);
        const blockName = getBlockNameFromFile(item);
        const name = path.join(outputPath, blockName, 'block.js');
        acc[name] = item;
        return acc;
    }, {});

    entries = Object.assign(entries, blocks);
    return entries;
}
const getGutenbergFrontEntries = () => {
    const sourcePath = Path.resolve(process.cwd(), 'sources', 'gutenberg');
    const blockFiles = glob.sync( (sourcePath+ '/**/front/script/index.js').replace(/\\/g,'/'));
    const outputPath = getGutenbergOutputPath();
    let entries = {};
    const blocks = blockFiles.reduce((acc, item) => {
        item = path.resolve(item);
        const blockName = getBlockNameFromFile(item);
        const name = path.join(outputPath, blockName, blockName + '.js');
        acc[name] = item;
        return acc;
    }, {});

    entries = Object.assign(entries, blocks);
    return entries;
}
const getGutenbergJsonFiles = () => {
    const sourcePath = Path.resolve(process.cwd(), 'sources', 'gutenberg');
    return glob.sync( (sourcePath+ '/**/block.json').replace(/\\/g,'/'));
}
const getGutenbergRenderFiles = () => {
    const sourcePath = Path.resolve(process.cwd(), 'sources', 'gutenberg');
    return glob.sync( (sourcePath+ '/**/render.php').replace(/\\/g,'/'));
}

const getGutenbergBlocks = () => {
    const sourcePath = Path.resolve(process.cwd(), 'sources', 'gutenberg');
    const blockFiles = glob.sync( (sourcePath+ '/**/block.json').replace(/\\/g,'/'));
    let entries = [];
    blockFiles.forEach(file => {
        const blockName = getBlockNameFromFile(file);
        entries.push(blockName);
    })

    return entries;
}

module.exports = {
    parsePath: parsePath,
    getSassFiles: getSassFiles,
    getCssFileNames: getCssFileNames,
    getGutenbergOutputPath: getGutenbergOutputPath,
    getBlockNameFromFile: getBlockNameFromFile,
    getBlockFileType: getBlockFileType,
    parseGutenbergBlockEntry: parseGutenbergBlockEntry,
    getGutenbergEntries: getGutenbergEntries,
    parseGutenbergBlockFrontEntry: parseGutenbergBlockFrontEntry,
    getGutenbergFrontEntries: getGutenbergFrontEntries,
    parseGutenbergBlockStyleEntry: parseGutenbergBlockStyleEntry,
    parseGutenbergBlockFrontStyleEntry: parseGutenbergBlockFrontStyleEntry,
    getGutenbergJsonFiles: getGutenbergJsonFiles,
    getGutenbergRenderFiles: getGutenbergRenderFiles,
    getGutenbergBlocks: getGutenbergBlocks
};