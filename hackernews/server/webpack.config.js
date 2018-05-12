var fs = require('fs');
var dotenv = require('dotenv')
var path = require('path');
var webpack = require('webpack');

dotenv.config()

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function (module) {
        return ['.bin'].indexOf(module) === -1;
    })
    .forEach(function (module) {
        nodeModules[module] = 'commonjs ' + module;
    });

module.exports = {
    entry: './src/index.js',

    mode: process.env.NODE_ENV,

    target: 'node',

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },

    externals: nodeModules,

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            presets: [
                                [
                                    'env',
                                    {
                                        modules: false,
                                        targets: {
                                            browsers: ['> 2%'],
                                            uglify: true
                                        }
                                    }
                                ]
                            ],
                            plugins: [
                                'transform-object-rest-spread',
                                [
                                    'transform-runtime',
                                    {
                                        polyfill: false,
                                        helpers: false
                                    }
                                ]
                            ]
                        }
                    }
                ]
            }
        ]
    }
};
