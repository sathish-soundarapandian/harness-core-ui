/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const path = require('path')
const fs = require('fs')

const webpack = require('webpack')
const { mergeWithRules } = require('webpack-merge')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

const commonConfig = require('./webpack.common')
const devServerProxyConfig = require('./devServerProxy.config')

const CONTEXT = process.cwd()
const isCypressCoverage = process.env.CYPRESS_COVERAGE === 'true'
const isCypress = process.env.CYPRESS === 'true'
const isCI = process.env.CI === 'true'

const certificateExists = fs.existsSync(path.join(CONTEXT, 'certificates/localhost.pem'))

// By default NG Auth UI is enabled in the dev environment.
// Set env variable HARNESS_ENABLE_NG_AUTH_UI=false to disable it.
const HARNESS_ENABLE_NG_AUTH_UI = process.env.HARNESS_ENABLE_NG_AUTH_UI !== 'false'
const DISABLE_TYPECHECK = process.env.DISABLE_TYPECHECK === 'true'
const HELP_PANEL_ACCESS_TOKEN = process.env.HELP_PANEL_ACCESS_TOKEN
const HELP_PANEL_SPACE = process.env.HELP_PANEL_SPACE
const HELP_PANEL_ENVIRONMENT = process.env.HELP_PANEL_ENVIRONMENT
const NEW_NAV_CONTENTFUL_ACCESS_TOKEN = process.env.NEW_NAV_CONTENTFUL_ACCESS_TOKEN
const NEW_NAV_CONTENTFUL_SPACE = process.env.NEW_NAV_CONTENTFUL_SPACE
const NEW_NAV_CONTENTFUL_ENVIRONMENT = process.env.NEW_NAV_CONTENTFUL_ENVIRONMENT
const DEV_FF = Object.keys(process.env)
  .filter(f => f.startsWith('FF_'))
  .reduce((obj, key) => ({ ...obj, [key.replace(/^FF_/, '')]: process.env[key] === 'true' }), {})

console.log('\nDev server env vars')
console.table(
  Object.assign(
    {
      HARNESS_ENABLE_NG_AUTH_UI,
      DISABLE_TYPECHECK,
      HELP_PANEL_ACCESS_TOKEN,
      HELP_PANEL_SPACE,
      HELP_PANEL_ENVIRONMENT
    },
    DEV_FF
  )
)

// certificates are required in non CI environments only
if (!isCI && !certificateExists) {
  throw new Error('The certificate is missing, please run `yarn generate-certificate`')
}

const config = {
  mode: 'development',
  devtool: isCI ? false : 'cheap-module-source-map',
  cache: isCI ? false : { type: 'filesystem' },
  output: {
    path: path.resolve(CONTEXT, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].[id].js',
    pathinfo: false,
    assetModuleFilename: 'images/[hash:7][ext][query]'
  },
  devServer: isCI
    ? undefined
    : {
        historyApiFallback: true,
        port: 8181,
        client: {
          overlay: !(isCypress || isCypressCoverage)
        },
        server: {
          type: 'https',
          options: {
            key: fs.readFileSync(path.resolve(CONTEXT, 'certificates/localhost-key.pem')),
            cert: fs.readFileSync(path.resolve(CONTEXT, 'certificates/localhost.pem'))
          }
        },
        proxy: Object.fromEntries(
          Object.entries(devServerProxyConfig).map(([key, value]) => [
            key,
            Object.assign({ logLevel: 'info', secure: false, changeOrigin: true }, value)
          ])
        )
      },
  module: {
    rules: [
      {
        test: /\.module\.scss$/,
        use: [
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: '[name]_[local]_[hash:base64:6]',
                exportLocalsConvention: 'camelCaseOnly'
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      __DEV__: true,
      HARNESS_ENABLE_NG_AUTH_UI,
      DEV_FF: JSON.stringify(DEV_FF)
    }),
    new HTMLWebpackPlugin({
      template: 'src/index.html',
      filename: 'index.html',
      minify: false,
      templateParameters: {
        __DEV__: true,
        __NON_CDN_BASE_PATH__: '/',
        HELP_PANEL_ACCESS_TOKEN_DEV: HELP_PANEL_ACCESS_TOKEN,
        HELP_PANEL_SPACE_DEV: HELP_PANEL_SPACE,
        HELP_PANEL_ENVIRONMENT_DEV: HELP_PANEL_ENVIRONMENT,
        NEW_NAV_CONTENTFUL_ACCESS_TOKEN_DEV: NEW_NAV_CONTENTFUL_ACCESS_TOKEN,
        NEW_NAV_CONTENTFUL_SPACE_DEV: NEW_NAV_CONTENTFUL_SPACE,
        NEW_NAV_CONTENTFUL_ENVIRONMENT_DEV: NEW_NAV_CONTENTFUL_ENVIRONMENT
      }
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].[id].css'
    }),
    new webpack.WatchIgnorePlugin({
      paths: [/node_modules(?!\/@harness)/, /\.(d|test)\.tsx?$/, /stringTypes\.ts/, /\.snap$/]
    })
  ]
}

// merging loader options
let mergedConfig = mergeWithRules({
  module: {
    rules: {
      test: 'match',
      use: {
        loader: 'match',
        options: 'merge'
      }
    }
  }
})(commonConfig, config)

// update rules for cypress
if (isCypress && isCypressCoverage) {
  mergedConfig = mergeWithRules({
    module: {
      rules: {
        test: 'match',
        use: 'prepend'
      }
    }
  })(mergedConfig, {
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          use: [
            {
              loader: 'babel-loader'
            }
          ]
        }
      ]
    }
  })

  mergedConfig = mergeWithRules({
    module: {
      rules: {
        test: 'match',
        use: {
          loader: 'match',
          options: 'replace'
        }
      }
    }
  })(mergedConfig, {
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          use: [
            {
              loader: 'swc-loader',
              options: {
                parseMap: true
              }
            }
          ]
        }
      ]
    }
  })
}

if (!(DISABLE_TYPECHECK || isCI || isCypress)) {
  mergedConfig.plugins.push(
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        memoryLimit: 4096
      }
    })
  )
}

module.exports = mergedConfig
