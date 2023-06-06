import Path from "path";
import path from "path";
import glob from "glob";

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

const getSassFiles = () => {
    const sassPath = path.resolve(process.cwd(), 'sources', 'sass', 'entries', '**.scss')
    return glob.sync(sassPath);
}

const getCssFileNames = (file) => {
    const filePath = parsePath(file);
    let finalFile = projectName;
    if (filePath.basename !== 'index' && filePath.basename !== 'main') finalFile += '-' + filePath.basename;
    finalFile += '.css';

    return {
        entryName: filePath.basename,
        cssFile: finalFile,
        mapFile: finalFile + '.map',
        minFile: finalFile.replace('.css', '.min.css')
    }
}

module.exports = {
    parsePath: parsePath,
    getSassFiles: getSassFiles,
    getCssFileNames: getCssFileNames
};