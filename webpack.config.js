const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const OUTPUT_PATH = resolve('dist/')

module.exports = {
  mode: 'development',
  entry: {
    index: resolve('src/views/app.jsx'),
    game: resolve('src/views/game.jsx'),
    player: resolve('src/views/player.jsx'),
  },
  output: {
    path: OUTPUT_PATH,
    filename: 'js/[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: resolve('.babelrc.js'),
          },
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin([OUTPUT_PATH]),
    new CopyWebpackPlugin([
      {
        from: 'src/',
        ignore: 'views/**/*',
      },
    ]),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  devtool: 'source-map',
}

function resolve(filePath) {
  return path.resolve(__dirname, filePath)
}
