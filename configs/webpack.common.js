/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

require('dotenv').config()

const path = require('path')

const webpack = require('webpack')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const ExternalRemotesPlugin = require('external-remotes-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { RetryChunkLoadPlugin } = require('webpack-retry-chunk-load-plugin')

const GenerateStringTypesPlugin = require('../scripts/webpack/GenerateStringTypesPlugin').GenerateStringTypesPlugin
const moduleFederationConfig = require('./modulefederation.config')
const CodeModules = require('../src/modules/60-code/modules')
const {
  container: { ModuleFederationPlugin }
} = webpack

const CONTEXT = process.cwd()
const ChildAppError = path.resolve(CONTEXT, './src/microfrontends/ChildAppError.tsx')

const enableGovernance = process.env.ENABLE_GOVERNANCE !== 'false'
const enableGitOpsUI = process.env.ENABLE_GITOPSUI !== 'false'
const enableChaosUI = process.env.ENABLE_CHAOS !== 'false'
const enableCDBUI = process.env.ENABLE_CDB_UI === 'true'
const enableCCMUI = process.env.ENABLE_CCM_UI === 'true'
const enableCIUI = process.env.ENABLE_CI_UI === 'true'
const enableTIUI = process.env.ENABLE_TI_UI === 'true'
const enableSTO = process.env.ENABLE_STO !== 'false'
const enableCODE = process.env.ENABLE_CODE === 'true'
const enableFFUI = process.env.ENABLE_FF_UI !== 'false'
const enableIACM = process.env.ENABLE_IACM !== 'false'
const enableSSCA = process.env.ENABLE_SSCA === 'true'
const enableIDP = process.env.ENABLE_IDP === 'true'
const enableSRMUI = process.env.ENABLE_SRM_UI === 'true'

console.log('Common build flags')
console.table({
  enableGovernance,
  enableGitOpsUI,
  enableChaosUI,
  enableCCMUI,
  enableCDBUI,
  enableCIUI,
  enableTIUI,
  enableSTO,
  enableCODE,
  enableFFUI,
  enableIACM,
  enableSSCA,
  enableIDP,
  enableSRMUI
})

const config = {
  context: CONTEXT,
  entry: path.resolve(CONTEXT, 'src/framework/app/index.tsx'),
  target: 'web',
  stats: {
    modules: false,
    children: false
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'swc-loader'
          }
        ]
      },
      {
        test: /\.module\.scss$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: '@harness/css-types-loader',
            options: {
              prettierConfig: CONTEXT
            }
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                mode: 'local',
                localIdentName: '[hash:base64:6]',
                exportLocalsConvention: 'camelCaseOnly'
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [path.join(CONTEXT, 'src')]
              },
              sourceMap: false,
              implementation: require('sass')
            }
          }
        ]
      },
      {
        test: /(?<!\.module)\.scss$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: false
            }
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [path.join(CONTEXT, 'src')]
              },
              implementation: require('sass')
            }
          }
        ]
      },
      {
        test: /\.(jpg|jpeg|png|svg|gif)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 2 * 1024 // 2kb
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: /node_modules/
      },
      {
        test: /\.ttf$/,
        type: 'asset/resource'
      },
      {
        test: /\.ya?ml$/,
        type: 'json',
        use: [
          {
            loader: 'yaml-loader'
          }
        ]
      },
      {
        test: /\.gql$/,
        type: 'asset/source'
      },
      {
        test: /\.(mp4)$/,
        type: 'asset/resource'
      }
    ]
  },
  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json', '.ttf'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(CONTEXT, 'tsconfig.json')
      })
    ],
    alias: {
      '@wings-software': '@harness'
    }
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        styles: {
          name: 'styles',
          type: 'css/mini-extract',
          chunks: 'all',
          enforce: true
        }
      }
    }
  },
  plugins: [
    new ExternalRemotesPlugin(),
    new ModuleFederationPlugin(
      moduleFederationConfig({
        enableGovernance,
        enableGitOpsUI,
        enableSTO,
        enableChaosUI,
        enableCCMUI,
        enableCDBUI,
        enableCIUI,
        enableTIUI,
        enableCODE,
        enableFFUI,
        enableIACM,
        enableSSCA,
        enableIDP,
        enableSRMUI
      })
    ),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
    new webpack.DefinePlugin({
      'process.env': '{}' // required for @blueprintjs/core
    }),
    new MonacoWebpackPlugin({
      // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
      languages: ['json', 'yaml', 'shell', 'powershell', 'python']
    }),
    new GenerateStringTypesPlugin(),
    new RetryChunkLoadPlugin({
      maxRetries: 2
    })
  ]
}

if (!enableGitOpsUI) {
  // render a mock app when Gitops MF is disabled
  config.resolve.alias['gitopsui/MicroFrontendApp'] = ChildAppError
}

if (!enableCCMUI) {
  // render a mock app when CCM MF is disabled
  config.resolve.alias['ccmui/MicroFrontendApp'] = ChildAppError
}

if (!enableCDBUI) {
  // render a mock app when CDB MF is disabled
  config.resolve.alias['cdbui/MicroFrontendApp'] = ChildAppError
}

if (!enableCIUI) {
  // render a mock app when CI MF is disabled
  config.resolve.alias['ciui/MicroFrontendApp'] = ChildAppError
}

if (!enableSRMUI) {
  // render a mock app when SRM MF is disabled
  config.resolve.alias['srmui/MicroFrontendApp'] = ChildAppError
}

if (!enableTIUI) {
  // render a mock app when TI MF is disabled
  config.resolve.alias['tiui/MicroFrontendApp'] = ChildAppError
}

if (!enableChaosUI) {
  // render a mock app when Chaos MF is disabled
  config.resolve.alias['chaos/MicroFrontendApp'] = ChildAppError
  config.resolve.alias['chaos/SelectPipelineExperiment'] = ChildAppError
  config.resolve.alias['chaos/ExperimentPreview'] = ChildAppError
  config.resolve.alias['chaos/ChaosStepExecution'] = ChildAppError
  config.resolve.alias['chaos/ResilienceViewContent'] = ChildAppError
  config.resolve.alias['chaos/ResilienceViewCTA'] = ChildAppError
}

if (!enableSTO) {
  // render a mock app when STO MF is disabled
  config.resolve.alias['sto/App'] = ChildAppError
  config.resolve.alias['stoV2/App'] = ChildAppError
  config.resolve.alias['sto/PipelineSecurityView'] = ChildAppError
  config.resolve.alias['stoV2/PipelineSecurityView'] = ChildAppError
}

// render a mock app when CODE MF is disabled
if (!enableCODE) {
  CodeModules.forEach(mod => (config.resolve.alias[mod] = ChildAppError))
}

if (!enableFFUI) {
  config.resolve.alias['ffui/MicroFrontendApp'] = ChildAppError
}

if (!enableIACM) {
  // render a mock app when IACM MF is disabled
  config.resolve.alias['iacm/MicroFrontendApp'] = ChildAppError
  config.resolve.alias['iacm/IACMStage'] = ChildAppError
  config.resolve.alias['iacm/IACMStageInputSet'] = ChildAppError
  config.resolve.alias['iacm/IACMPipelineResources'] = ChildAppError
}

if (!enableSSCA) {
  config.resolve.alias['ssca/MicroFrontendApp'] = ChildAppError
}

if (!enableIDP) {
  config.resolve.alias['idp/MicroFrontendApp'] = ChildAppError
  config.resolve.alias['idpadmin/MicroFrontendApp'] = ChildAppError
}

module.exports = config
