const path = require('path');
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );

const config =  {
    devtool: 'source-map',
    entry: {},
    output: {
        filename: '[name]',
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
                include: path.resolve(process.cwd(), 'sources', 'gutenberg'),
                use: 'babel-loader'
            },
            {
                test: /\.js$/,
                include: path.resolve(process.cwd(), 'sources', 'gutenberg'),
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