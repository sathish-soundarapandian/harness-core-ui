/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const startupCommand = {
  type: 'Git',
  spec: {
    connectorRef: '<+input>',
    repoName: '<+input>',
    branch: '<+input>',
    gitFetchType: 'Branch',
    paths: '<+input>'
  }
}

export const applicationSettings = {
  type: 'Git',
  spec: {
    connectorRef: '<+input>',
    repoName: '<+input>',
    branch: '<+input>',
    gitFetchType: 'Branch',
    paths: '<+input>'
  }
}

export const connectionStrings = {
  type: 'Git',
  spec: {
    connectorRef: '<+input>',
    repoName: '<+input>',
    commitId: '<+input>',
    gitFetchType: 'Commit',
    paths: '<+input>'
  }
}

export const template = {
  startupCommand: {
    type: 'Git',
    spec: {
      connectorRef: '<+input>',
      repoName: '<+input>',
      branch: '<+input>',
      gitFetchType: 'Branch',
      paths: '<+input>'
    }
  },
  applicationSettings: {
    type: 'Git',
    spec: {
      connectorRef: '<+input>',
      repoName: '<+input>',
      branch: '<+input>',
      gitFetchType: 'Branch',
      paths: '<+input>'
    }
  },
  connectionStrings: {
    type: 'Git',
    spec: {
      connectorRef: '<+input>',
      repoName: '<+input>',
      commitId: '<+input>',
      gitFetchType: 'Commit',
      paths: '<+input>'
    }
  }
}
