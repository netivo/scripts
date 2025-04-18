const glob = require('glob');
const path = require('path');

const projectName = (typeof process.env.npm_package_name !== 'undefined' &&process.env.npm_package_name !== '') ? process.env.npm_package_name : 'name';
let packageData = (typeof process.env.npm_package_json !== 'undefined' && process.env.npm_package_json !== '') ? require(process.env.npm_package_json) : {};
const scriptExternals = (typeof packageData.external_scripts !== 'undefined') ? packageData.external_scripts : {};

const projectPath = path.resolve(process.cwd(), 'sources', 'javascript');
const projectFiles = glob.sync((projectPath+'/entries/**.js').replace(/\\/g,'/'));

let entries = {};

const projectParts = projectFiles.reduce((acc, item) => {
    item = path.resolve(item);
    let partName = path.basename(item);
    if(partName === 'main.js' || partName === 'index.js') partName = '.js';
    else partName = '-'+partName;
    const name = path.join('dist', projectName+partName);
    acc[name] = item;
    return acc;
}, {});

entries = Object.assign(entries, projectParts);

const config =  {
    devtool: 'source-map',
    entry: entries,
    output: {
        filename: '[name]',
        path: path.resolve(process.cwd())
    },
    externals: scriptExternals,
    module: {
        rules: [
            {
                test: /\.js$/,
                use: require.resolve( 'source-map-loader' ),
                enforce: 'pre',
            },
            {
                test: /\.js$/,
                include: path.resolve( process.cwd(), 'sources', 'javascript'),
                use: 'babel-loader'
            },
        ]
    }
};

module.exports = config;