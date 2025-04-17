const glob = require('glob');
const path = require('path');

const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

const projectName = (typeof process.env.npm_package_name !== 'undefined' &&process.env.npm_package_name !== '') ? process.env.npm_package_name : 'name';

let packageData = (typeof process.env.npm_package_json !== 'undefined' && process.env.npm_package_json !== '') ? require(process.env.npm_package_json) : {};

const gutenOutput = (typeof packageData.gutenberg !== 'undefined' && packageData.gutenberg !== '') ? packageData.gutenberg : path.join('dist','gutenberg');

const scriptExternals = (typeof packageData.external_scripts !== 'undefined') ? packageData.external_scripts : {};

const projectPath = path.resolve(process.cwd(), 'sources', 'javascript');
const projectFiles = glob.sync((projectPath+'/entries/**.js').replace(/\\/g,'/'));

const gutenPath = path.resolve(process.cwd(), 'sources', 'gutenberg');
const gutenBlocksFiles = glob.sync( (gutenPath+ '/**/admin/index.js').replace(/\\/g,'/'));
const gutenJSFiles = glob.sync( (gutenPath+ '/**/front/script/index.js').replace(/\\/g,'/'));


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

//entries[projectPath] = path.resolve( process.cwd(), 'sources', 'javascript', 'index.js' );


const gutenBlocks = gutenBlocksFiles.reduce((acc, item) => {
    item = path.resolve(item);
    const blockName = item.replace(path.sep + 'admin'+ path.sep +'index.js', '').replace(gutenPath+path.sep, '');
    const name = path.join(gutenOutput, blockName, 'block.js');
    acc[name] = item;
    return acc;
}, {});

const gutenJS = gutenJSFiles.reduce((acc, item) => {
    item = path.resolve(item);
    const blockName = item.replace(path.sep + 'front' + path.sep + 'script' + path.sep + 'index.js', '').replace(gutenPath+path.sep, '');
    const name = path.join(gutenOutput, blockName, blockName + '.js');
    acc[name] = item;
    return acc;
}, {});


entries = Object.assign(entries, gutenBlocks, gutenJS);

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
            {
                test: /\.js$/,
                include: gutenPath,
                use: [
                    {
                        loader: require.resolve( 'babel-loader' ),
                        options: {
                            cacheDirectory: process.env.BABEL_CACHE_DIRECTORY || true,
                            babelrc: false,
                            configFile: false,
                            presets: [ require.resolve( '@wordpress/babel-preset-default' ) ]
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new DependencyExtractionWebpackPlugin( { injectPolyfill: true } ),
    ].filter(Boolean),
};

module.exports = config;