/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const mockProvisionerConnectorResponse = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'aws test',
      identifier: 'aws_test',
      description: '',
      orgIdentifier: 'harness',
      projectIdentifier: 'iacm',
      tags: {},
      type: 'Aws',
      spec: {
        credential: {
          crossAccountAccess: null,
          type: 'ManualConfig',
          spec: { accessKey: 'key', accessKeyRef: null, secretKeyRef: 'secret' },
          region: 'us-gov-west-1'
        },
        delegateSelectors: [],
        executeOnDelegate: false
      }
    },
    createdAt: 1668684640859,
    lastModifiedAt: 1668684640856,
    status: {
      status: 'FAILURE',
      errorSummary:
        'Error Encountered (Check if access key, secret key are valid. \nCheck if user has required permissions to describe regions.\nRun this command to check the details about the IAM user/role: `aws sts get-caller-identity`\n\nRefer Harness NG documentation for configuring AWS connector settings: https://ngdocs.harness.io/article/m5vkql35ca-aws-connector-settings-reference)',
      errors: [
        {
          reason: 'Unexpected Error',
          message:
            'Check if access key, secret key are valid. \nCheck if user has required permissions to describe regions.\nRun this command to check the details about the IAM user/role: `aws sts get-caller-identity`\n\nRefer Harness NG documentation for configuring AWS connector settings: https://ngdocs.harness.io/article/m5vkql35ca-aws-connector-settings-reference',
          code: 450
        }
      ],
      testedAt: 1668684646067,
      lastTestedAt: 0,
      lastConnectedAt: 0
    },
    activityDetails: { lastActivityTime: 1668684640869 },
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
      repoUrl: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    governanceMetadata: null
  },
  metaData: null,
  correlationId: '00bdc16e-d4f8-46d5-a7bb-1879c8fac961'
}

const mockRepoConnectorResponse = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'test',
      identifier: 'test',
      description: null,
      orgIdentifier: 'harness',
      projectIdentifier: 'iacm',
      tags: {},
      type: 'Git',
      spec: {
        url: 'http://null',
        validationRepo: 'test',
        branchName: null,
        delegateSelectors: [],
        executeOnDelegate: true,
        type: 'Http',
        connectionType: 'Account',
        spec: { username: 'test', usernameRef: null, passwordRef: 'secret' }
      }
    },
    createdAt: 1668525396967,
    lastModifiedAt: 1668525396964,
    status: {
      status: 'FAILURE',
      errorSummary:
        "Error Encountered (Task has expired. It wasn't picked up by any delegate or delegate did not have enough time to finish the execution)",
      errors: [
        {
          reason: 'Unexpected Error',
          message:
            "Task has expired. It wasn't picked up by any delegate or delegate did not have enough time to finish the execution",
          code: 450
        }
      ],
      testedAt: 1668525637839,
      lastTestedAt: 0,
      lastConnectedAt: 0
    },
    activityDetails: { lastActivityTime: 1668525396991 },
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
      repoUrl: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    governanceMetadata: null
  },
  metaData: null,
  correlationId: 'f0e85f90-3c12-4bbd-bb04-d8e6d9b8f4df'
}

export { mockProvisionerConnectorResponse, mockRepoConnectorResponse }
