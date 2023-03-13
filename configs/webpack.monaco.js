/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const path = require('path')

const CONTEXT = process.cwd()
module.exports = {
  entry: {
    // Package each language's worker and give these filenames in `getWorker` or `getWorkerUrl`
    editorWorker2: { import: 'monaco-editor/esm/vs/editor/editor.worker.js', filename: '[name].js' },
    yamlWorker2: { import: '@harness/monaco-yaml/lib/esm/yaml.worker.js', filename: '[name].js' }
  },
  output: {
    filename: '[name].js',
    path: path.resolve(CONTEXT, 'dist/static')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.ttf$/,
        type: 'asset/resource'
      }
    ]
  }
}
