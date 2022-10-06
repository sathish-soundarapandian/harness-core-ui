/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetMockDataWithMutateAndRefetch, UseGetReturnData } from '@common/utils/testUtils'
import type {
  ResponseInputSetResponse,
  ResponseInputSetYamlDiff,
  ResponseOverlayInputSetResponse,
  ResponsePageInputSetSummaryResponse
} from 'services/pipeline-ng'

export const GetInputSetsInlineResponse: UseGetReturnData<ResponsePageInputSetSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      totalPages: 1,
      totalItems: 4,
      pageItemCount: 4,
      pageSize: 20,
      content: [
        {
          identifier: 'overlayInp2',
          name: 'overlayInp2',
          pipelineIdentifier: 'testpip',
          inputSetType: 'OVERLAY_INPUT_SET',
          isOutdated: true,
          storeType: 'INLINE'
        },
        {
          identifier: 'overlayInp1',
          name: 'overlayInp1',
          pipelineIdentifier: 'testpip',
          inputSetType: 'OVERLAY_INPUT_SET',
          isOutdated: true,
          storeType: 'INLINE'
        },
        {
          identifier: 'testInp2',
          name: 'testInp2',
          pipelineIdentifier: 'testpip',
          inputSetType: 'INPUT_SET',
          isOutdated: false,
          storeType: 'INLINE'
        },
        {
          identifier: 'testInp1',
          name: 'testInp1',
          pipelineIdentifier: 'testpip',
          inputSetType: 'INPUT_SET',
          isOutdated: true,
          storeType: 'INLINE'
        }
      ],
      pageIndex: 0,
      empty: false
    },
    correlationId: '59f494ca-2bfc-4e05-8bd8-a6df59cf81da'
  }
}

export const GetInputSetsOldGitSyncResponse: UseGetReturnData<ResponsePageInputSetSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      totalPages: 1,
      totalItems: 5,
      pageItemCount: 5,
      pageSize: 20,
      content: [
        {
          identifier: 'overlayInpG2',
          name: 'overlayInpG2',
          pipelineIdentifier: 'Eric_Git_Sync',
          inputSetType: 'OVERLAY_INPUT_SET',

          gitDetails: {
            objectId: '8df272eec2cf32777315d9fd9a7751d17d51209a',
            branch: 'master',
            repoIdentifier: 'oldgitsyncharness',
            rootFolder: '/.harness/',
            filePath: 'overlayInpG2.yaml'
          },

          isOutdated: true
        },
        {
          identifier: 'overlayInpG1',
          name: 'overlayInpG1',
          pipelineIdentifier: 'Eric_Git_Sync',
          inputSetType: 'OVERLAY_INPUT_SET',

          gitDetails: {
            objectId: '81a71b80ea92b25526a89af631992e1cebfb7a99',
            branch: 'master',
            repoIdentifier: 'oldgitsyncharness',
            rootFolder: '/.harness/',
            filePath: 'overlayInpG1.yaml'
          },

          isOutdated: true
        },
        {
          identifier: 'inpG1',
          name: 'inpG1',
          pipelineIdentifier: 'Eric_Git_Sync',
          inputSetType: 'INPUT_SET',

          gitDetails: {
            objectId: 'a038fb723463db750d0ed9afcee1a1e473621585',
            branch: 'master',
            repoIdentifier: 'oldgitsyncharness',
            rootFolder: '/.harness/',
            filePath: 'inpG1.yaml'
          },

          isOutdated: true
        },
        {
          identifier: 'inpG3',
          name: 'inpG3',
          pipelineIdentifier: 'Eric_Git_Sync',
          inputSetType: 'INPUT_SET',

          gitDetails: {
            objectId: 'de58455fb30cebcbc6ca43deb5178b6ea8b01c51',
            branch: 'master',
            repoIdentifier: 'oldgitsyncharness',
            rootFolder: '/.harness/',
            filePath: 'inpG3.yaml'
          },

          isOutdated: true
        },
        {
          identifier: 'inpG2',
          name: 'inpG2',
          pipelineIdentifier: 'Eric_Git_Sync',
          inputSetType: 'INPUT_SET',

          gitDetails: {
            objectId: '5a884f406ce50ce81cb5695bdf12adf4a13edb86',
            branch: 'master',
            repoIdentifier: 'oldgitsyncharness',
            rootFolder: '/.harness/',
            filePath: 'inpG2.yaml'
          },

          isOutdated: false
        }
      ],
      pageIndex: 0,
      empty: false
    },
    correlationId: 'e29b65b2-3671-4b40-9955-9bb2af2ea8f7'
  }
}

export const GetInputSetsRemoteGitSyncResponse: UseGetReturnData<ResponsePageInputSetSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      totalPages: 1,
      totalItems: 4,
      pageItemCount: 4,
      pageSize: 20,
      content: [
        {
          identifier: 'testRemOverlayInp2',
          name: 'testRemOverlayInp2',
          pipelineIdentifier: 'testRemPip',
          inputSetType: 'OVERLAY_INPUT_SET',

          gitDetails: {
            filePath: '.harness/testRemOverlayInp2.yaml',
            repoName: 'git-sync-harness'
          },

          isOutdated: false,

          storeType: 'REMOTE',
          connectorRef: 'Eric_Git_Con'
        },
        {
          identifier: 'testRemOverlayInp1',
          name: 'testRemOverlayInp1',
          pipelineIdentifier: 'testRemPip',
          inputSetType: 'OVERLAY_INPUT_SET',

          gitDetails: {
            filePath: '.harness/testRemOverlayInp1.yaml',
            repoName: 'git-sync-harness'
          },

          isOutdated: false,

          storeType: 'REMOTE',
          connectorRef: 'Eric_Git_Con'
        },
        {
          identifier: 'testRemInp2',
          name: 'testRemInp2',
          pipelineIdentifier: 'testRemPip',
          inputSetType: 'INPUT_SET',

          gitDetails: {
            filePath: '.harness/testRemInp2.yaml',
            repoName: 'git-sync-harness'
          },
          isOutdated: false,
          storeType: 'REMOTE',
          connectorRef: 'Eric_Git_Con'
        },
        {
          identifier: 'testRemInp1',
          name: 'testRemInp1',
          pipelineIdentifier: 'testRemPip',
          inputSetType: 'INPUT_SET',
          gitDetails: {
            filePath: '.harness/testRemInp1.yaml',
            repoName: 'git-sync-harness'
          },
          isOutdated: false,
          storeType: 'REMOTE',
          connectorRef: 'Eric_Git_Con'
        }
      ],
      pageIndex: 0,
      empty: false
    },
    correlationId: '59f494ca-2bfc-4e05-8bd8-a6df59cf81da'
  }
}

export const GetInvalidInputSetInline: UseGetReturnData<ResponseInputSetResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      accountId: 'OgiB4-xETamKNVAz-wQRjw',
      orgIdentifier: 'default',
      projectIdentifier: 'Eric',
      pipelineIdentifier: 'testpip',
      identifier: 'testInp1',
      inputSetYaml:
        'inputSet:\n  identifier: "testInp1"\n  name: "testInp1"\n  tags: {}\n  orgIdentifier: "default"\n  projectIdentifier: "Eric"\n  pipeline:\n    identifier: "testpip"\n    stages:\n    - stage:\n        identifier: "stg1"\n        type: "Custom"\n        spec:\n          execution:\n            steps:\n            - step:\n                identifier: "stp1"\n                type: "Http"\n                spec:\n                  url: "https://test.com"\n                  method: "GET"\n                  requestBody: "req"\n',
      name: 'testInp1',
      tags: {},
      storeType: 'INLINE',
      errorResponse: false,
      outdated: true
    },
    correlationId: '88583e35-6c57-4078-8775-d159a25944fb'
  }
}

export const GetInvalidInputSetRemote: UseGetReturnData<ResponseInputSetResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      accountId: 'OgiB4-xETamKNVAz-wQRjw',
      orgIdentifier: 'default',
      projectIdentifier: 'Eric',
      pipelineIdentifier: 'testRemPip',
      identifier: 'testRemInp1',
      inputSetYaml:
        'inputSet:\n  identifier: "testRemInp1"\n  name: "testRemInp1"\n  orgIdentifier: "default"\n  projectIdentifier: "Eric"\n  pipeline:\n    identifier: "testRemPip"\n    stages:\n    - stage:\n        identifier: "stg1"\n        type: "Custom"\n        spec:\n          execution:\n            steps:\n            - step:\n                identifier: "stp1"\n                type: "Http"\n                spec:\n                  url: "https://test.com"\n                  method: "GET"\n                  requestBody: "req"\n                timeout: "10m"\n',
      name: 'testRemInp1',
      tags: {},
      inputSetErrorWrapper: {
        type: 'InputSetErrorWrapperDTOPMS',
        errorPipelineYaml:
          'pipeline:\n  identifier: "testRemPip"\n  stages:\n  - stage:\n      identifier: "stg1"\n      type: "Custom"\n      spec:\n        execution:\n          steps:\n          - step:\n              identifier: "stp1"\n              type: "Http"\n              spec:\n                requestBody: "pipeline.stages.stg1.spec.execution.steps.stp1.spec.requestBody"\n',
        uuidToErrorResponseMap: {
          'pipeline.stages.stg1.spec.execution.steps.stp1.spec.requestBody': {
            errors: [
              {
                fieldName: 'requestBody',
                message: 'Field not a runtime input',
                identifierOfErrorSource: 'testRemInp1'
              }
            ]
          }
        }
      },
      gitDetails: {
        objectId: '8bf90e1faae2ddd871da5eb199a9c2c87017d8d5',
        branch: 'master',
        filePath: '.harness/testRemInp1.yaml',
        repoName: 'git-sync-harness',
        commitId: 'bbdf6031a2ee5c83de808e615906825bd83dca5f',
        fileUrl: 'https://github.com/Eric761/git-sync-harness/blob/master/.harness/testRemInp1.yaml'
      },
      entityValidityDetails: {
        valid: false,
        invalidYaml:
          'inputSet:\n  identifier: "testRemInp1"\n  name: "testRemInp1"\n  orgIdentifier: "default"\n  projectIdentifier: "Eric"\n  pipeline:\n    identifier: "testRemPip"\n    stages:\n    - stage:\n        identifier: "stg1"\n        type: "Custom"\n        spec:\n          execution:\n            steps:\n            - step:\n                identifier: "stp1"\n                type: "Http"\n                spec:\n                  url: "https://test.com"\n                  method: "GET"\n                  requestBody: "req"\n                timeout: "10m"\n'
      },
      storeType: 'REMOTE',
      connectorRef: 'Eric_Git_Con',
      errorResponse: true,
      outdated: false
    },
    correlationId: '88cac226-7c0f-4e25-b097-bbb1420817bc'
  }
}

export const GetInvalidInputSetOldGitSync: UseGetReturnData<ResponseInputSetResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      accountId: 'px7xd_BFRCi-pfWPYXVjvw',
      orgIdentifier: 'default',
      projectIdentifier: 'Kapil',
      pipelineIdentifier: 'Eric_Git_Sync',
      identifier: 'inpG1',
      inputSetYaml:
        'inputSet:\n  identifier: "inpG1"\n  name: "inpG1"\n  orgIdentifier: "default"\n  projectIdentifier: "Kapil"\n  pipeline:\n    identifier: "Eric_Git_Sync"\n    stages:\n    - stage:\n        identifier: "stg1"\n        type: "Custom"\n        spec:\n          execution:\n            steps:\n            - step:\n                identifier: "stp1"\n                type: "Http"\n                spec:\n                  url: "https://b.m"\n                  method: "GET"\n                  requestBody: "req"\n                timeout: "10m"\n',
      name: 'inpG1',
      gitDetails: {
        objectId: 'a038fb723463db750d0ed9afcee1a1e473621585',
        branch: 'master',
        repoIdentifier: 'oldgitsyncharness',
        rootFolder: '/.harness/',
        filePath: 'inpG1.yaml'
      },
      errorResponse: false,
      outdated: true
    },
    correlationId: 'e5e17a18-f209-46fc-90f5-6bf4ff847824'
  }
}

export const GetInvalidOverlayISInline: UseGetReturnData<ResponseOverlayInputSetResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      accountId: 'OgiB4-xETamKNVAz-wQRjw',
      orgIdentifier: 'default',
      projectIdentifier: 'Eric',
      pipelineIdentifier: 'testpip',
      identifier: 'overlayInp1',
      name: 'overlayInp1',
      inputSetReferences: ['testInp2', 'testInp1'],
      overlayInputSetYaml:
        'overlayInputSet:\n  name: overlayInp1\n  identifier: overlayInp1\n  orgIdentifier: default\n  projectIdentifier: Eric\n  pipelineIdentifier: testpip\n  inputSetReferences:\n    - testInp2\n    - testInp1\n  tags: {}\n',
      storeType: 'INLINE',
      errorResponse: false,
      outdated: true
    },
    correlationId: 'e41afc14-a831-4187-96da-6dba2a3b1037'
  }
}

export const GetInvalidOverlayISRemote: UseGetReturnData<ResponseOverlayInputSetResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      accountId: 'OgiB4-xETamKNVAz-wQRjw',
      orgIdentifier: 'default',
      projectIdentifier: 'Eric',
      pipelineIdentifier: 'testRemPip',
      identifier: 'testRemOverlayInp1',
      name: 'testRemOverlayInp1',
      inputSetReferences: ['testRemInp1', 'testRemInp2'],
      overlayInputSetYaml:
        'overlayInputSet:\n  name: testRemOverlayInp1\n  identifier: testRemOverlayInp1\n  orgIdentifier: default\n  projectIdentifier: Eric\n  pipelineIdentifier: testRemPip\n  inputSetReferences:\n    - testRemInp1\n    - testRemInp2\n  tags: {}\n',
      invalidInputSetReferences: {
        testRemInp1: 'Reference is an invalid Input Set'
      },
      gitDetails: {
        objectId: 'bf2ecbf0383153f6f4c8a859f45348e44d922db3',
        branch: 'master',
        filePath: '.harness/testRemOverlayInp1.yaml',
        repoName: 'git-sync-harness',
        commitId: 'df273fa323cf8224e33a2cccacc652c4d260c20d',
        fileUrl: 'https://github.com/Eric761/git-sync-harness/blob/master/.harness/testRemOverlayInp1.yaml'
      },
      entityValidityDetails: {
        valid: false,
        invalidYaml:
          'overlayInputSet:\n  name: testRemOverlayInp1\n  identifier: testRemOverlayInp1\n  orgIdentifier: default\n  projectIdentifier: Eric\n  pipelineIdentifier: testRemPip\n  inputSetReferences:\n    - testRemInp1\n    - testRemInp2\n  tags: {}\n'
      },
      storeType: 'REMOTE',
      connectorRef: 'Eric_Git_Con',
      errorResponse: true,
      outdated: false
    },
    correlationId: 'ad9a655c-b807-4e6d-ba95-8f58e8734031'
  }
}

export const GetInvalidOverlayISOldGitSync: UseGetReturnData<ResponseOverlayInputSetResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      accountId: 'px7xd_BFRCi-pfWPYXVjvw',
      orgIdentifier: 'default',
      projectIdentifier: 'Kapil',
      pipelineIdentifier: 'Eric_Git_Sync',
      identifier: 'overlayInpG1',
      name: 'overlayInpG1',
      inputSetReferences: ['inpG1', 'inpG3', 'inpG2'],
      overlayInputSetYaml:
        'overlayInputSet:\n  name: overlayInpG1\n  identifier: overlayInpG1\n  orgIdentifier: default\n  projectIdentifier: Kapil\n  pipelineIdentifier: Eric_Git_Sync\n  inputSetReferences:\n    - inpG1\n    - inpG3\n    - inpG2\n  tags: {}\n',
      tags: {},
      gitDetails: {
        objectId: '81a71b80ea92b25526a89af631992e1cebfb7a99',
        branch: 'master',
        repoIdentifier: 'oldgitsyncharness',
        rootFolder: '/.harness/',
        filePath: 'overlayInpG1.yaml'
      },
      errorResponse: false,
      outdated: true
    },
    correlationId: '19441223-c30f-4fc5-86c1-123918c315a8'
  }
}

export const GetInputSetYamlDiffInline: UseGetReturnData<ResponseInputSetYamlDiff> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      oldYAML:
        'inputSet:\n  identifier: "testInp1"\n  name: "testInp1"\n  tags: {}\n  orgIdentifier: "default"\n  projectIdentifier: "Eric"\n  pipeline:\n    identifier: "testpip"\n    stages:\n    - stage:\n        identifier: "stg1"\n        type: "Custom"\n        spec:\n          execution:\n            steps:\n            - step:\n                identifier: "stp1"\n                type: "Http"\n                spec:\n                  url: "https://test.com"\n                  method: "GET"\n                  requestBody: "req"\n',
      newYAML:
        'inputSet:\n  identifier: "testInp1"\n  name: "testInp1"\n  tags: {}\n  orgIdentifier: "default"\n  projectIdentifier: "Eric"\n  pipeline:\n    identifier: "testpip"\n    stages:\n    - stage:\n        identifier: "stg1"\n        type: "Custom"\n        spec:\n          execution:\n            steps:\n            - step:\n                identifier: "stp1"\n                type: "Http"\n                spec:\n                  url: "https://test.com"\n                  method: "GET"\n',
      noUpdatePossible: false,
      inputSetEmpty: false
    },
    correlationId: '2a9de950-6094-4022-9596-a7697071c15f'
  }
}

export const GetInputSetYamlDiffRemote: UseGetReturnData<ResponseInputSetYamlDiff> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      oldYAML:
        'inputSet:\n  identifier: "testRemInp1"\n  name: "testRemInp1"\n  orgIdentifier: "default"\n  projectIdentifier: "Eric"\n  pipeline:\n    identifier: "testRemPip"\n    stages:\n    - stage:\n        identifier: "stg1"\n        type: "Custom"\n        spec:\n          execution:\n            steps:\n            - step:\n                identifier: "stp1"\n                type: "Http"\n                spec:\n                  url: "https://test.com"\n                  method: "GET"\n                  requestBody: "req"\n                timeout: "10m"\n',
      newYAML:
        'inputSet:\n  identifier: "testRemInp1"\n  name: "testRemInp1"\n  orgIdentifier: "default"\n  projectIdentifier: "Eric"\n  pipeline:\n    identifier: "testRemPip"\n    stages:\n    - stage:\n        identifier: "stg1"\n        type: "Custom"\n        spec:\n          execution:\n            steps:\n            - step:\n                identifier: "stp1"\n                type: "Http"\n                spec:\n                  url: "https://test.com"\n                  method: "GET"\n                timeout: "10m"\n',
      noUpdatePossible: false,
      gitDetails: {
        objectId: '8bf90e1faae2ddd871da5eb199a9c2c87017d8d5',
        branch: 'master',
        filePath: '.harness/testRemInp1.yaml',
        repoName: 'git-sync-harness',
        commitId: 'bbdf6031a2ee5c83de808e615906825bd83dca5f',
        fileUrl: 'https://github.com/Eric761/git-sync-harness/blob/master/.harness/testRemInp1.yaml'
      },
      inputSetEmpty: false
    },
    correlationId: '7bca5cee-dea1-4bf6-a0cd-317d4f3da880'
  }
}

export const GetInputSetYamlDiffOldGitSync: UseGetReturnData<ResponseInputSetYamlDiff> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      oldYAML:
        'inputSet:\n  identifier: "inpG1"\n  name: "inpG1"\n  orgIdentifier: "default"\n  projectIdentifier: "Kapil"\n  pipeline:\n    identifier: "Eric_Git_Sync"\n    stages:\n    - stage:\n        identifier: "stg1"\n        type: "Custom"\n        spec:\n          execution:\n            steps:\n            - step:\n                identifier: "stp1"\n                type: "Http"\n                spec:\n                  url: "https://b.m"\n                  method: "GET"\n                  requestBody: "req"\n                timeout: "10m"\n',
      newYAML:
        'inputSet:\n  identifier: "inpG1"\n  name: "inpG1"\n  orgIdentifier: "default"\n  projectIdentifier: "Kapil"\n  pipeline:\n    identifier: "Eric_Git_Sync"\n    stages:\n    - stage:\n        identifier: "stg1"\n        type: "Custom"\n        spec:\n          execution:\n            steps:\n            - step:\n                identifier: "stp1"\n                type: "Http"\n                spec:\n                  url: "https://b.m"\n                  method: "GET"\n                timeout: "10m"\n',
      noUpdatePossible: false,
      gitDetails: {
        objectId: 'a038fb723463db750d0ed9afcee1a1e473621585',
        branch: 'master',
        repoIdentifier: 'oldgitsyncharness',
        rootFolder: '/.harness/',
        filePath: 'inpG1.yaml'
      },
      inputSetEmpty: false
    },

    correlationId: 'd5c945af-609f-4f05-af2a-997d360327bd'
  }
}

export const GetOverlayISYamlDiffInline: UseGetReturnData<ResponseInputSetYamlDiff> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      oldYAML:
        'overlayInputSet:\n  name: overlayInp1\n  identifier: overlayInp1\n  orgIdentifier: default\n  projectIdentifier: Eric\n  pipelineIdentifier: testpip\n  inputSetReferences:\n    - testInp2\n    - testInp1\n  tags: {}\n',
      newYAML:
        'overlayInputSet:\n  name: "overlayInp1"\n  identifier: "overlayInp1"\n  orgIdentifier: "default"\n  projectIdentifier: "Eric"\n  pipelineIdentifier: "testpip"\n  inputSetReferences:\n  - "testInp2"\n  tags: {}\n',
      noUpdatePossible: false,
      invalidReferences: ['testInp1'],
      inputSetEmpty: false
    },
    correlationId: '4ead5c76-39e9-4a00-b1b8-4f68baf5bf15'
  }
}

export const GetOverlayISYamlDiffRemote: UseGetReturnData<ResponseInputSetYamlDiff> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      oldYAML:
        'overlayInputSet:\n  name: testRemOverlayInp1\n  identifier: testRemOverlayInp1\n  orgIdentifier: default\n  projectIdentifier: Eric\n  pipelineIdentifier: testRemPip\n  inputSetReferences:\n    - testRemInp1\n    - testRemInp2\n  tags: {}\n',
      newYAML:
        'overlayInputSet:\n  name: "testRemOverlayInp1"\n  identifier: "testRemOverlayInp1"\n  orgIdentifier: "default"\n  projectIdentifier: "Eric"\n  pipelineIdentifier: "testRemPip"\n  inputSetReferences:\n  - "testRemInp2"\n  tags: {}\n',
      noUpdatePossible: false,
      invalidReferences: ['testRemInp1'],
      gitDetails: {
        objectId: 'bf2ecbf0383153f6f4c8a859f45348e44d922db3',
        branch: 'master',
        filePath: '.harness/testRemOverlayInp1.yaml',
        repoName: 'git-sync-harness',
        commitId: 'df273fa323cf8224e33a2cccacc652c4d260c20d',
        fileUrl: 'https://github.com/Eric761/git-sync-harness/blob/master/.harness/testRemOverlayInp1.yaml'
      },
      inputSetEmpty: false
    },
    correlationId: 'abba98fb-9852-4918-ad91-066cadd27093'
  }
}

export const GetOverlayISYamlDiffOldGitSync: UseGetReturnData<ResponseInputSetYamlDiff> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      oldYAML:
        'overlayInputSet:\n  name: overlayInpG1\n  identifier: overlayInpG1\n  orgIdentifier: default\n  projectIdentifier: Kapil\n  pipelineIdentifier: Eric_Git_Sync\n  inputSetReferences:\n    - inpG1\n    - inpG3\n    - inpG2\n  tags: {}\n',
      newYAML:
        'overlayInputSet:\n  name: "overlayInpG1"\n  identifier: "overlayInpG1"\n  orgIdentifier: "default"\n  projectIdentifier: "Kapil"\n  pipelineIdentifier: "Eric_Git_Sync"\n  inputSetReferences:\n  - "inpG2"\n  tags: {}\n',
      noUpdatePossible: false,
      invalidReferences: ['inpG1', 'inpG3'],
      gitDetails: {
        objectId: '81a71b80ea92b25526a89af631992e1cebfb7a99',
        branch: 'master',
        repoIdentifier: 'oldgitsyncharness',
        rootFolder: '/.harness/',
        filePath: 'overlayInpG1.yaml'
      },
      inputSetEmpty: false
    },
    correlationId: '4a4c9866-2bd3-44a2-8bee-8ed96481f38a'
  }
}

export const GetYamlDiffDelResponse: UseGetReturnData<ResponseInputSetYamlDiff> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      noUpdatePossible: false,
      inputSetEmpty: true
    },
    correlationId: '569e8c24-154a-4550-87e0-30151412b889'
  }
}

export const mockErrorMessage = {
  message: 'Failed to fetch: 403 Forbidden',
  data: '<!DOCTYPE html>\n<html lang="en-US">\n   <head>\n      <title>Access denied</title>\n      <meta http-equiv="X-UA-Compatible" content="IE=Edge" />\n      <meta name="robots" content="noindex, nofollow" />\n      <meta name="viewport" content="width=device-width,initial-scale=1" />\n      <link rel="stylesheet" href="/cdn-cgi/styles/errors.css" media="screen" />\n      <script>\n(function(){if(document.addEventListener&&window.XMLHttpRequest&&JSON&&JSON.stringify){var e=function(a){var c=document.getElementById("error-feedback-survey"),d=document.getElementById("error-feedback-success"),b=new XMLHttpRequest;a={event:"feedback clicked",properties:{errorCode:1020,helpful:a,version:4}};b.open("POST","https://sparrow.cloudflare.com/api/v1/event");b.setRequestHeader("Content-Type","application/json");b.setRequestHeader("Sparrow-Source-Key","c771f0e4b54944bebf4261d44bd79a1e");\nb.send(JSON.stringify(a));c.classList.add("feedback-hidden");d.classList.remove("feedback-hidden")};document.addEventListener("DOMContentLoaded",function(){var a=document.getElementById("error-feedback"),c=document.getElementById("feedback-button-yes"),d=document.getElementById("feedback-button-no");"classList"in a&&(a.classList.remove("feedback-hidden"),c.addEventListener("click",function(){e(!0)}),d.addEventListener("click",function(){e(!1)}))})}})();\n</script>\n\n      <script>\n         (function(){if(document.addEventListener){var c=function(){var b=document.getElementById("copy-label");document.getElementById("plain-ray-id");if(navigator.clipboard)navigator.clipboard.writeText("74010bfafc5c1d24");else{var a=document.createElement("textarea");a.value="74010bfafc5c1d24";a.style.top="0";a.style.left="0";a.style.position="fixed";document.body.appendChild(a);a.focus();a.select();document.execCommand("copy");document.body.removeChild(a)}b.innerText="Copied"};document.addEventListener("DOMContentLoaded",\nfunction(){var b=document.getElementById("plain-ray-id"),a=document.getElementById("click-to-copy-btn");"classList"in b&&(b.classList.add("hidden"),a.classList.remove("hidden"),a.addEventListener("click",c))})}})();\n      </script>\n      <script defer src="https://performance.radar.cloudflare.com/beacon.js"></script>\n   </head>\n\n   <body>\n      <div class="main-wrapper" role="main">\n         <div class="header section">\n            <h1>\n               <span class="error-description">Access denied</span>\n               <span class="code-label">Error code <span>1020</span></span>\n            </h1>\n            <div class="large-font">\n               <p>You cannot access qa.harness.io. Refresh the page or contact the site owner to request access.</p>\n            </div>\n         </div>\n      </div>\n\n      <div>\n         <div class="section know-more">\n            <h2 class="large-font">Troubleshooting information</h2>\n            <p>Copy and paste the Ray ID when you contact the site owner.</p>\n            <p class="ray-id-wrapper">\n               Ray ID:\n               <span class="plain-ray-id" id="plain-ray-id">\n                  74010bfafc5c1d24\n               </span>\n               <button class="click-to-copy-btn hidden" id="click-to-copy-btn" title="Click to copy Ray ID" type="button">\n                  <span class="ray-id">74010bfafc5c1d24</span><span class="copy-label" id="copy-label">Copy</span>\n               </button>\n            </p>\n            <p>\n            For help visit <a rel="noopener noreferrer" href="https://support.cloudflare.com/hc/articles/360029779472-Troubleshooting-Cloudflare-1XXX-errors?utm_source=1020_error#error1020" target="_blank">Troubleshooting guide</a>\n            <img class="external-link" title="Opens in new tab" src="/cdn-cgi/images/external.png" alt="External link">\n            </p>\n         </div>\n\n         <div class="clearfix footer section" role="contentinfo">\n            <div class="column">\n               <div class="feedback-hidden py-8 text-center" id="error-feedback">\n    <div id="error-feedback-survey" class="footer-line-wrapper">\n        Was this page helpful?\n        <button class="border border-solid bg-white cf-button cursor-pointer ml-4 px-4 py-2 rounded" id="feedback-button-yes" type="button">Yes</button>\n        <button class="border border-solid bg-white cf-button cursor-pointer ml-4 px-4 py-2 rounded" id="feedback-button-no" type="button">No</button>\n    </div>\n    <div class="feedback-success feedback-hidden" id="error-feedback-success">\n        Thank you for your feedback!\n    </div>\n</div>\n\n            </div>\n            <div class="column footer-line-wrapper text-center">\n               Performance &amp; security by <a rel="noopener noreferrer" href="https://www.cloudflare.com?utm_source=1020_error" target="_blank">Cloudflare</a>\n               <img class="external-link" title="Opens in new tab" src="/cdn-cgi/images/external.png" alt="External link">\n            </div>\n         </div>\n      </div>\n   </body>\n</html>\n',
  status: 403
}

export const mockRepos = {
  status: 'SUCCESS',
  data: [{ name: 'repo1' }, { name: 'repo2' }, { name: 'repo3' }, { name: 'repotest1' }, { name: 'repotest2' }],
  metaData: null,
  correlationId: 'correlationId'
}

export const mockBranches = {
  status: 'SUCCESS',
  data: {
    branches: [{ name: 'main' }, { name: 'main-demo' }, { name: 'main-patch' }, { name: 'main-patch2' }],
    defaultBranch: { name: 'main' }
  },
  metaData: null,
  correlationId: 'correlationId'
}

export const mockInvalidInputSetsList: UseGetMockDataWithMutateAndRefetch<ResponsePageInputSetSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      content: [
        {
          identifier: 'inputset1',
          inputSetType: 'INPUT_SET',
          name: 'is1',
          pipelineIdentifier: 'PipelineId',
          isOutdated: true
        },
        {
          identifier: 'inputset2',
          inputSetType: 'INPUT_SET',
          name: 'is2',
          pipelineIdentifier: 'PipelineId',
          isOutdated: false
        },
        {
          identifier: 'overlay1',
          inputSetType: 'OVERLAY_INPUT_SET',
          name: 'ol1',
          pipelineIdentifier: 'PipelineId',
          isOutdated: true
        }
      ]
    }
  }
}

export const GetInputSetYamlDiffInpSelector: UseGetReturnData<ResponseInputSetYamlDiff> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      oldYAML:
        'inputSet:\n  identifier: "inputset1"\n  name: "is1"\n  tags: {}\n  orgIdentifier: "default"\n  projectIdentifier: "Eric"\n  pipeline:\n    identifier: "PipelineId"\n    stages:\n    - stage:\n        identifier: "stg1"\n        type: "Custom"\n        spec:\n          execution:\n            steps:\n            - step:\n                identifier: "stp1"\n                type: "Http"\n                spec:\n                  url: "https://test.com"\n                  method: "GET"\n                  requestBody: "req"\n',
      newYAML:
        'inputSet:\n  identifier: "inputset1"\n  name: "is1"\n  tags: {}\n  orgIdentifier: "default"\n  projectIdentifier: "Eric"\n  pipeline:\n    identifier: "PipelineId"\n    stages:\n    - stage:\n        identifier: "stg1"\n        type: "Custom"\n        spec:\n          execution:\n            steps:\n            - step:\n                identifier: "stp1"\n                type: "Http"\n                spec:\n                  url: "https://test.com"\n                  method: "GET"\n',
      noUpdatePossible: false,
      inputSetEmpty: false
    },
    correlationId: '2a9de950-6094-4022-9596-a7697071c15f'
  }
}

export const GetOverlayISYamlDiffInpSelector: UseGetReturnData<ResponseInputSetYamlDiff> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      oldYAML:
        'overlayInputSet:\n  name: ol1\n  identifier: overlay1\n  orgIdentifier: default\n  projectIdentifier: Eric\n  pipelineIdentifier: PipelineId\n  inputSetReferences:\n    - inputset2\n    - inputset1\n  tags: {}\n',
      newYAML:
        'overlayInputSet:\n  name: "ol1"\n  identifier: "overlay1"\n  orgIdentifier: "default"\n  projectIdentifier: "Eric"\n  pipelineIdentifier: "PipelineId"\n  inputSetReferences:\n  - "inputset2"\n  tags: {}\n',
      noUpdatePossible: false,
      invalidReferences: ['inputset1'],
      inputSetEmpty: false
    },
    correlationId: '4ead5c76-39e9-4a00-b1b8-4f68baf5bf15'
  }
}
