/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const secret = {
  secret: {
    type: 'SecretText',
    name: 'csmsecret',
    identifier: 'csmsecret',
    orgIdentifier: 'default',
    projectIdentifier: 'Templates_Variable',
    tags: {},
    description: '',
    spec: {
      secretManagerIdentifier: 'customSM',
      valueType: 'CustomSecretManagerValues',
      value: '{"environmentVariables":[{"name":"var1","type":"String","value":"vaulttoken"}]}'
    }
  },
  createdAt: 1602137336275,
  updatedAt: 1602137336275,
  draft: false
}

export const secretResponse = {
  status: 'SUCCESS',
  data: secret,
  metaData: null,
  correlationId: '6e899566-142d-4c4e-a2b1-1713ecf41080'
}

export const secretManagerResponse = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'customSM',
      identifier: 'customSM',
      description: '',
      orgIdentifier: 'default',
      projectIdentifier: 'Templates_Variable',
      tags: {},
      type: 'CustomSecretManager',
      spec: {
        delegateSelectors: [],
        onDelegate: true,
        connectorRef: null,
        host: null,
        workingDirectory: null,
        template: {
          templateRef: 'Secret_Manager_2',
          versionLabel: '2',
          templateInputs: { environmentVariables: [{ name: 'var1', type: 'String', value: 'MeenaGitTokenDemo' }] }
        },
        testVariables: null,
        default: false
      }
    },
    createdAt: 1660297462482,
    lastModifiedAt: 1660839597456,
    status: {
      status: 'SUCCESS',
      errorSummary: null,
      errors: null,
      testedAt: 1660839606377,
      lastTestedAt: 0,
      lastConnectedAt: 1660839606377
    },
    activityDetails: { lastActivityTime: 1660839598400 },
    harnessManaged: false,
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null,
      commitId: null,
      fileUrl: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    governanceMetadata: null
  },
  metaData: null,
  correlationId: '2b9c3807-aa60-4bed-8142-b2e5f418ff7c'
}

export const secretManagerList = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 100,
    content: [
      {
        connector: {
          name: 'customSM',
          identifier: 'customSM',
          description: '',
          orgIdentifier: 'default',
          projectIdentifier: 'Templates_Variable',
          tags: {},
          type: 'CustomSecretManager',
          spec: {
            delegateSelectors: [],
            onDelegate: true,
            connectorRef: null,
            host: null,
            workingDirectory: null,
            template: {
              templateRef: 'Secret_Manager_2',
              versionLabel: '2',
              templateInputs: { environmentVariables: [{ name: 'var1', type: 'String', value: 'MeenaGitTokenDemo' }] }
            },
            testVariables: null,
            default: false
          }
        }
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '54df0eb7-99bf-47bc-8b20-e09fe09d1b7c'
}
