/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// ***********************************************************
/* eslint-disable @typescript-eslint/no-var-requires, no-console  */
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

const { cypressEsbuildPreprocessor } = require('cypress-esbuild-preprocessor')
const path = require('path')
const { addMatchImageSnapshotPlugin } = require('cypress-image-snapshot/plugin')

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // we register our plugin using its register method:
  addMatchImageSnapshotPlugin(on, config)

  if (process.env.CYPRESS_COVERAGE) {
    require('@cypress/code-coverage/task')(on, config)
  }
  on(
    'file:preprocessor',
    cypressEsbuildPreprocessor({
      esbuildOptions: {
        // optional tsconfig for typescript support and path mapping (see https://github.com/evanw/esbuild for all options)
        tsconfig: path.resolve(__dirname, '../tsconfig.json')
      }
    })
  )
  return config
}
