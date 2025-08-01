module.exports = {
  output: {
    libraryTarget: 'umd',  // 导出umd 格式	
    globalObject: 'this', 
  },
  mode: 'production',
  resolve: {
    extensions: ['.json', '.js'],
  },
  // module: {
  //   rules: [
  //     {
  //       test: /\.jsx?$/,
  //       use: {
  //         loader: 'babel-loader',
  //       },
  //     }
  //   ],
  // },
  externals: [
    {
      react: 'React',
    },
  ],
};
