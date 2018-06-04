let path = require('path')
let dotenv = require('dotenv')
let nodeExternals = require('webpack-node-externals')

dotenv.config()

module.exports = {
  entry: './src/index.js',

  mode: process.env.NODE_ENV,

  target: 'node',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },

  externals: [
    nodeExternals()
  ],

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
}
