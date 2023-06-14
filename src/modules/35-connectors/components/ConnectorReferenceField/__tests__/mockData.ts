/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const githubConnectorMock = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'sunnyGithub',
      identifier: 'sunnyGithub',
      description: '',
      orgIdentifier: 'default',
      projectIdentifier: 'defaultproject',
      tags: {},
      type: 'Github',
      spec: {
        url: 'https://github.com/harness/mockRepo',
        validationRepo: null,
        authentication: {
          type: 'Http',
          spec: {
            type: 'UsernameToken',
            spec: { username: 'sunnykesh-harness', usernameRef: null, tokenRef: 'testToken' }
          }
        },
        apiAccess: { type: 'Token', spec: { tokenRef: 'testToken' } },
        delegateSelectors: [],
        executeOnDelegate: false,
        type: 'Repo'
      }
    },
    createdAt: 1683479742718,
    lastModifiedAt: 1683479742698,
    status: {
      status: 'SUCCESS',
      errorSummary: null,
      errors: null,
      testedAt: 1683479746947,
      lastTestedAt: 0,
      lastConnectedAt: 1683479746947
    },
    activityDetails: { lastActivityTime: 1683479743044 },
    harnessManaged: false,
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null,
      commitId: null,
      fileUrl: null,
      repoUrl: null,
      parentEntityConnectorRef: null,
      parentEntityRepoName: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    governanceMetadata: null
  },
  metaData: null,
  correlationId: 'mockCorrelationId'
}
