const path = require('path');

module.exports = {
  entry: `${__dirname}/interface/src/main.js`,
  target: 'electron-main',
  module: {
    rules: [
      {
        test: /.*js$/,
        include: [
          path.resolve(__dirname, 'interface/src'),
        ],
        use: {
          loader: 'babel-loader'
        },
      },
    ],
  },
  output: {
    filename: 'bundle.js',
    path:     `${__dirname}/interface`,
  },
};
