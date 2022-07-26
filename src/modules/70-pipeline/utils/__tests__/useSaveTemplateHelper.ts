/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const createTemplatePromiseArg = {
  body: `template:
  name: Test Http Template
  identifier: Test_Http_Template
  versionLabel: v1
  type: Step
  projectIdentifier: Yogesh_Test
  orgIdentifier: default
  tags: {}
  spec:
    type: Http
    timeout: 1m 40s
    spec:
      url: <+input>
      method: GET
      headers: []
      outputVariables: []
      requestBody: <+input>
`,
  queryParams: {
    accountIdentifier: undefined,
    branch: 'feature',
    comments: '',
    commitMsg: 'common.gitSync.createResource',
    createPr: false,
    filePath: 'Test_Http_Template_v1.yaml',
    isNewBranch: false,
    orgIdentifier: 'default',
    projectIdentifier: 'Yogesh_Test',
    repoIdentifier: 'gitSyncRepo',
    rootFolder: '/rootFolderTest/.harness/',
    targetBranch: ''
  },
  requestOptions: {
    headers: {
      'Content-Type': 'application/yaml'
    }
  }
}

export const updateExistingTemplateLabelPromiseArg = {
  body: `template:
  name: Test Http Template
  identifier: Test_Http_Template
  versionLabel: v1
  type: Step
  projectIdentifier: Yogesh_Test
  orgIdentifier: default
  tags: {}
  spec:
    type: Http
    timeout: 1m 40s
    spec:
      url: <+input>
      method: GET
      headers: []
      outputVariables: []
      requestBody: <+input>
`,
  queryParams: {
    accountIdentifier: undefined,
    branch: 'feature',
    comments: '',
    commitMsg: 'common.gitSync.updateResource',
    createPr: false,
    filePath: 'test_pipeline.yaml',
    isNewBranch: false,
    lastObjectId: '4471ec3aa40c26377353974c29a6670d998db06f',
    orgIdentifier: undefined,
    projectIdentifier: undefined,
    repoIdentifier: 'gitSyncRepo',
    rootFolder: '/rootFolderTest/.harness/',
    targetBranch: ''
  },
  requestOptions: {
    headers: {
      'Content-Type': 'application/yaml'
    }
  },
  templateIdentifier: 'Test_Http_Template',
  versionLabel: 'v1'
}
