const glob = require('glob');
const path = require('path');

const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

const projectName = (typeof process.env.npm_package_name !== 'undefined' &&process.env.npm_package_name !== '') ? process.env.npm_package_name : 'name';
const gutenOutput = (typeof process.env.npm_package_gutenberg !== 'undefined' && process.env.npm_package_gutenberg !== '') ? process.env.npm_package_gutenberg : path.join('Netivo','Theme','Admin','views','gutenberg');

const projectPath = path.resolve(process.cwd(), 'sources', 'javascript');
const projectFiles = glob.sync((projectPath+'/entries/**.js').replace(/\\/g,'/'));

const gutenPath = path.resolve(process.cwd(), 'sources', 'gutenberg');
const gutenBlocksFiles = glob.sync( (gutenPath+ '/**/index.js').replace(/\\/g,'/'));

let entries = {};

const projectParts = projectFiles.reduce((acc, item) => {
    item = path.resolve(item);
    let partName = path.basename(item);
    if(partName === 'main.js' || partName === 'index.js') partName = '';
    else partName = '-'+partName;
    const name = path.join('dist', projectName+partName);
    acc[name] = item;
    return acc;
}, {});

entries = Object.assign(entries, projectParts);

//entries[projectPath] = path.resolve( process.cwd(), 'sources', 'javascript', 'index.js' );


const gutenBlocks = gutenBlocksFiles.reduce((acc, item) => {
    item = path.resolve(item);
    const blockName = item.replace(path.sep + 'index.js', '').replace(gutenPath+path.sep, '');
    const name = path.join(gutenOutput, blockName, 'block');
    acc[name] = item;
    return acc;
}, {});


entries = Object.assign(entries, gutenBlocks);

const config =  {
    devtool: 'source-map',
    entry: entries,
    output: {
        filename: '[name].js',
        path: path.resolve(process.cwd())
    },
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