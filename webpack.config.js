// // 


// To make build package to just export .d.ts files un comment below code and comment the uncommented code and run 
// yarn build 















// // TODO: Minimizing CSS in release build (`yarn build`)
// //

// const path = require('path')
// const nodeExternals = require('webpack-node-externals')
// const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
// const isDev = process.env.NODE_ENV === 'development'

// module.exports = {
//   mode: isDev ? 'development' : 'production',
//   stats: 'errors-only',

//   entry: {
//     index: './src/framework/AppStore/ChildAppTypes.tsx'
//   },

//   // devtool: isDev ? 'cheap-eval-source-map' : 'source-map',
//   // 'cheap-eval-source-map' does not generate good mapping to original
//   // TypeScript source at all. Use 'source-map' all the way instead
//   devtool: 'source-map',

//   module: {
//     rules: [
//       {
//         test: /\.tsx?$/,
//         loader: 'ts-loader',
//         exclude: /node_modules/,
//         options: { transpileOnly: isDev }
//       },
//       {
//         test: /\.css$/,
//         exclude: /node_modules/,
//         use: [
//           {
//             loader: MiniCssExtractPlugin.loader,
//             options: {}
//           },
//           {
//             loader: 'css-loader',
//             options: {
//               sourceMap: true,
//               modules: {
//                 mode: 'local',
//                 localIdentName: '[name]--[local]'
//               }
//             }
//           },
//           {
//             loader: 'postcss-loader',
//             options: {
//               sourceMap: isDev,
//               postcssOptions: {
//                 plugins: [require('postcss-import')(), require('postcss-mixins')(), require('postcss-nested')()]
//               }
//             }
//           }
//         ]
//       },
//       {
//         test: /\.svg$/,
//         exclude: /node_modules/,
//         use: ['@svgr/webpack']
//       }
//     ]
//   },
//   resolve: {
//     extensions: ['.tsx', '.ts', '.js']
//   },

//   output: {
//     filename: '[name].js',
//     path: path.resolve(__dirname, 'dist'),
//     libraryTarget: 'umd'
//   },

//   externals: [nodeExternals()],

//   plugins: [
//     new MiniCssExtractPlugin({
//       filename: '[name].css',
//       chunkFilename: '[name]-[id].css'
//     }),
//     new ForkTsCheckerWebpackPlugin()
//   ]
// }
/* eslint-disable @typescript-eslint/no-var-requires, no-console  */

const buildVersion = JSON.stringify(require('./package.json').version)
const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const devServerProxyConfig = require('./webpack.devServerProxy.config')

const deps = require('./package.json').dependencies
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const CircularDependencyPlugin = require('circular-dependency-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const JSONGeneratorPlugin = require('@wings-software/jarvis/lib/webpack/json-generator-plugin').default
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')
const GenerateStringTypesPlugin = require('./scripts/webpack/GenerateStringTypesPlugin').GenerateStringTypesPlugin
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const { BugsnagSourceMapUploaderPlugin } = require('webpack-bugsnag-plugins')

const DEV = process.env.NODE_ENV === 'development'
const ON_PREM = `${process.env.ON_PREM}` === 'true'
// this BUGSNAG_TOKEN needs to be same which is passed in the docker file
const BUGSNAG_TOKEN = process.env.BUGSNAG_TOKEN
const BUGSNAG_SOURCEMAPS_UPLOAD = `${process.env.BUGSNAG_SOURCEMAPS_UPLOAD}` === 'true'
const CONTEXT = process.cwd()
const isCypressCoverage = process.env.CYPRESS_COVERAGE
const isCypress = process.env.CYPRESS
const babelLoaderConfig = {
  loader: 'babel-loader'
}
const tsLoaderConfig = {
  loader: 'ts-loader',
  options: {
    transpileOnly: true
  }
}
const tsLoaders = []
if (isCypress && isCypressCoverage) {
  tsLoaders.push(babelLoaderConfig)
  tsLoaders.push(tsLoaderConfig)
} else {
  tsLoaders.push(tsLoaderConfig)
}

const config = {
  context: CONTEXT,
  entry: './src/framework/app/App.tsx',
  target: 'web',
  mode: DEV ? 'development' : 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: DEV ? '/' : '',
    filename: DEV ? 'static/[name].js' : 'static/[name].[contenthash:6].js',
    chunkFilename: DEV ? 'static/[name].[id].js' : 'static/[name].[id].[contenthash:6].js',
    pathinfo: false
  },
  devtool: DEV ? 'cheap-module-source-map' : 'hidden-source-map',
  devServer: {
    contentBase: false,
    port: 8181,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, './certificates/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, './certificates/localhost.pem'))
    },
    proxy: Object.fromEntries(
      Object.entries(devServerProxyConfig).map(([key, value]) => [
        key,
        Object.assign({ logLevel: 'info', secure: false, changeOrigin: true }, value)
      ])
    ),
    stats: {
      children: false,
      maxModules: 0,
      chunks: false,
      assets: false,
      modules: false
    }
  },
  stats: {
    modules: false,
    children: false
  },
  cache: DEV ? { type: 'filesystem' } : false,
  module: {
    rules: [
      {
        test: /\.m?js$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: tsLoaders
      },
      {
        test: /\.module\.scss$/,
        exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: '@wings-software/css-types-loader',
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
                localIdentName: DEV ? '[name]_[local]_[hash:base64:6]' : '[hash:base64:6]',
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
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 2000,
              fallback: 'file-loader'
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.ttf$/,
        loader: 'file-loader'
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
        use: [
          {
            loader: 'file-loader'
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.tsx', '.json', '.ttf'],
    plugins: [new TsconfigPathsPlugin()]
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
}

const commonPlugins = [
  new MiniCssExtractPlugin({
    filename: DEV ? 'static/[name].css' : 'static/[name].[contenthash:6].css',
    chunkFilename: DEV ? 'static/[name].[id].css' : 'static/[name].[id].[contenthash:6].css'
  }),
  new HTMLWebpackPlugin({
    template: 'src/index.html',
    filename: 'index.html',
    minify: false,
    templateParameters: {
      __DEV__: DEV,
      __ON_PREM__: ON_PREM
    }
  }),
  new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en/),
  new webpack.DefinePlugin({
    'process.env': '{}', // required for @blueprintjs/core
    __DEV__: DEV,
    __ON_PREM__: ON_PREM,
    __BUGSNAG_RELEASE_VERSION__: buildVersion
  }),
  new MonacoWebpackPlugin({
    // available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
    languages: ['yaml', 'shell', 'powershell']
  }),
  new GenerateStringTypesPlugin()
]

const devOnlyPlugins = [
  new ModuleFederationPlugin({
    name: 'home',
    filename: 'remoteEntry.js',
    remotes: {
      accesscontrol: 'accesscontrol@http://localhost:3003/remoteEntry.js'
    },
    shared: {
      react: {
        singleton: true,
        requiredVersion: deps.react
      },
      'react-dom': {
        singleton: true,
        requiredVersion: deps['react-dom']
      }
    }
  }),
  new webpack.WatchIgnorePlugin({
    paths: [/node_modules(?!\/@wings-software)/, /\.d\.ts$/, /stringTypes\.ts/]
  }),
  new ForkTsCheckerWebpackPlugin()
  // new BundleAnalyzerPlugin()
]

const prodOnlyPlugins = [
  new JSONGeneratorPlugin({
    content: {
      version: require('./package.json').version,
      gitCommit: process.env.GIT_COMMIT,
      gitBranch: process.env.GIT_BRANCH
    },
    filename: 'static/version.json'
  }),
  new CircularDependencyPlugin({
    exclude: /node_modules/,
    failOnError: true
  }),
  new HTMLWebpackPlugin({
    template: 'src/versions.html',
    filename: 'static/versions.html',
    minify: false,
    inject: false
  })
]
if (BUGSNAG_SOURCEMAPS_UPLOAD && BUGSNAG_TOKEN) {
  prodOnlyPlugins.push(
    new BugsnagSourceMapUploaderPlugin({
      apiKey: BUGSNAG_TOKEN,
      appVersion: require('./package.json').version,
      publicPath: '*',
      overwrite: true
    })
  )
}
config.plugins = commonPlugins.concat(DEV ? devOnlyPlugins : prodOnlyPlugins)

console.log({
  DEV,
  FsEvents: process.env.TSC_WATCHFILE === 'UseFsEvents',
  BUGSNAG_SOURCEMAPS_UPLOAD,
  BugsnagTokenPresent: !!BUGSNAG_TOKEN
})

module.exports = config
