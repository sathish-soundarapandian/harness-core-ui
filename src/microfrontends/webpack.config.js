/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const path = require('path')
const tsTransformPaths = require('@harness/ts-transform-paths')
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
              getCustomTransformers: program => {
                const transformer = tsTransformPaths(program)

                return {
                  before: [transformer.before], // for updating paths in generated code
                  afterDeclarations: [transformer.afterDeclarations] // for updating paths in declaration files
                }
              }
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: []
  }
}
