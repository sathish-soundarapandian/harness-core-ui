/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
module.exports = {
  mode: 'production',
  entry: './src/microfrontends/index.ts',
  output: {
    path: path.join(__dirname, 'dist/microfrontends'),
    filename: 'index.js',
    libraryTarget: 'umd'
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'src/microfrontends/tsconfig.json',
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: 'src/microfrontends/tsconfig.json',
        logLevel: 'info',
        extensions: ['.ts', '.tsx'],
         mainFields: ["@rbac", "main"],
        // baseUrl: "/foo"
      })
    ]
  }
}
