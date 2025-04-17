
const webpack = require("webpack");
const develop = () => {
    return new Promise((resolve, reject) => {
        const webpackConfig = require("../config/webpack.build");
        webpackConfig['mode'] = 'development';
        webpack(webpackConfig, (err, stats) => {
            if(err) {
                reject(err);
            }
            else {
                resolve(stats);
            }
        });
    });
};

const compile = () => {
    return new Promise((resolve, reject) => {
        const webpackConfig = require("../config/webpack.build");
        webpackConfig['mode'] = 'production';
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

module.exports = {
    develop: develop,
    compile: compile
}