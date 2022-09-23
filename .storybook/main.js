/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const webpackConfig = require('../configs/webpack.dev')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const MonacoWebpackPlugin = require(require.resolve('monaco-editor-webpack-plugin', { paths: [process.cwd()] }))
const path = require('path')
const { merge, mergeWithRules } = require('webpack-merge')
const webpack = require('webpack')
const CONTEXT = process.cwd()

module.exports = {
  core: {
    builder: 'webpack5'
  },
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  webpackFinal: config => {
    const c1 = mergeWithRules({
      module: {
        rules: {
          test: 'match',
          use: 'replace'
        }
      }
    })(config, {
      // cache: { type: 'filesystem', name: 'storybook' },
      devtool: false,
      module: {
        rules: [
          {
            test: /\.(mjs|tsx?|jsx?)$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'swc-loader'
              }
            ]
          },
          ...webpackConfig.module.rules
        ]
      },
      resolve: {
        ...webpackConfig.resolve,
        alias: {
          ...webpackConfig.resolve.alias,
          'gitopsui/MicroFrontendApp': false,
          'chaos/MicroFrontendApp': false,
          'sto/App': false,
          'governance/App': false,
          'governance/EvaluationView': false,
          'governance/PolicySetWizard': false,
          'governance/EvaluationModal': false,
          'governance/PipelineGovernanceView': false,
          'monaco-editor/.*': false,
          '@harness/monaco-yaml/.*': false
        }
      },
      plugins: [
        new MiniCssExtractPlugin({
          filename: 'static/[name].css',
          chunkFilename: 'static/[name].[id].css'
        }),
        new MonacoWebpackPlugin({
          // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
          languages: ['yaml', 'shell', 'powershell']
        }),
        new webpack.WatchIgnorePlugin({
          paths: [/node_modules(?!\/@harness)/, /\.(d|test)\.tsx?$/, /stringTypes\.ts/, /\.snap$/]
        })
      ]
    })

    return c1
  }
}
