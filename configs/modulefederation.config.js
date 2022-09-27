/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const packageJSON = require('../package.json')
const { pick, omit, mapValues } = require('lodash')

/**
 * These packages must be strictly shared with exact versions
 */
const ExactSharedPackages = [
  'react-dom',
  'react',
  'react-router-dom',
  '@harness/use-modal',
  '@blueprintjs/core',
  '@blueprintjs/select',
  '@blueprintjs/datetime',
  'restful-react',
  'urql'
]

module.exports = ({ enableGitOpsUI, enableSTO, enableChaosUI, enableCCMUI, enableSCM, enableFFUI }) => {
  const remotes = {}

  if (enableGitOpsUI) {
    // use of single quotes within function call is required to make this work
    remotes.gitopsui = "gitopsui@[window.getApiBaseUrl('gitops/remoteEntry.js')]"
  }

  // TODO (tnhu): Use build an environment variable to enable Governance
  // if (enableGovernance) {
  remotes.governance = "governance@[window.getApiBaseUrl('pm/remoteEntry.js')]"
  // }

  if (enableCCMUI) {
    remotes.ccmui = "ccmui@[window.getApiBaseUrl('ccmui/remoteEntry.js')]"
  }

  if (enableSTO) {
    remotes.sto = "sto@[window.getApiBaseUrl('sto/remoteEntry.js')]"
    remotes.stoV2 = "stoV2@[window.getApiBaseUrl('sto/v2/remoteEntry.js')]"
  }

  if (enableChaosUI) {
    remotes.chaos = "chaos@[window.getApiBaseUrl('chaos/remoteEntry.js')]"
  }

  if (enableSCM) {
    remotes.scm = "scm@[window.getApiBaseUrl('scm/remoteEntry.js')]"
  }

  if (enableFFUI) {
    remotes.ffui = "ffui@[window.getApiBaseUrl('cf/web/remoteEntry.js')]"
  }

  if (process.env.TARGET_LOCALHOST) {
    remotes.errortracking = 'errortracking@http://localhost:3091/remoteEntry.js'
  } else {
    remotes.errortracking = "errortracking@[window.getApiBaseUrl('et/remoteEntry.js')]"
  }

  const shared = {
    ...mapValues(pick(packageJSON.dependencies, ExactSharedPackages), version => ({
      singleton: true,
      requiredVersion: version
    }))
  }

  return {
    name: 'nextgenui',
    remotes,
    shared
  }
}
