/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getMockFor_useGetPipeline = (): any => ({
  data: {
    status: 'SUCCESS',
    data: {
      yamlPipeline:
        'version: 1\nname: Yaml Simp 2\ninputs:\n  image:\n    type: string\n    desc: image name\n    default: golang\n    required: true\n  repo:\n    type: string\n    desc: repository name\n    required: true\n    prompt: true\nrepository:\n  connector: account.github\n  name: <+inputs.repo>\nstages:\n  - name: output variable\n    type: ci\n    spec:\n      steps:\n        - name: one test\n          type: script\n          spec:\n            image: <+inputs.image>\n            run: export foo=bar\n            shell: sh\n            outputs:\n              - foo\n        - name: two\n          type: script\n          spec:\n            image: alpine\n            run: echo <+steps.one_test.output.outputVariables.foo>\n            pull: always\n',
      entityValidityDetails: { valid: true, invalidYaml: null },
      modules: [],
      storeType: 'INLINE'
    },
    metaData: null,
    correlationId: 'edd182f2-93fa-44cf-9990-d9c21af34b3b'
  }
})

export const getMockFor_Generic_useMutate = (mutateMock?: jest.Mock): any => ({
  loading: false,
  refetch: jest.fn(),
  mutate:
    mutateMock ||
    jest.fn().mockResolvedValue({
      data: {
        correlationId: '',
        status: 'SUCCESS',
        metaData: null,
        data: {}
      }
    })
})

export const getMockFor_useGetTemplateFromPipeline = (): any => ({
  mutate: jest.fn().mockResolvedValue({
    inputs: {
      image: { prompt: false, required: true, default: 'golang', type: 'string', desc: 'image name' },
      repo: { prompt: true, required: true, type: 'string', desc: 'repository name' }
    },
    repository: {
      reference: {
        type: { prompt: false, required: true, type: 'string', enums: ['branch', 'tag', 'pr'] },
        value: { prompt: false, required: true, type: 'string' }
      }
    }
  })
})

export const getCICodebaseInputSetFormInitialValues = () => ({
  inputs: {},
  repository: {
    reference: {
      type: 'branch',
      value: ''
    }
  }
})

export const GetUseGetConnectorAcctUrlTypeResponse = {
  status: 'SUCCESS',
  data: {
    data: {
      connector: {
        name: 'mt-acct-type-repo',
        identifier: 'github',
        description: '',
        orgIdentifier: 'default',
        projectIdentifier: 'default',
        tags: {},
        type: 'Github',
        spec: {
          url: 'https://github.com',
          validationRepo: 'sdf',
          authentication: {
            type: 'Http',
            spec: {
              type: 'UsernameToken',
              spec: {
                username: 'asdf',
                usernameRef: null,
                tokenRef: 'account.testGitPrivateToken7P192KsDDl'
              }
            }
          },
          apiAccess: null,
          delegateSelectors: [],
          executeOnDelegate: false,
          type: 'Account'
        }
      },
      createdAt: 1651880828672,
      lastModifiedAt: 1651880828665,
      status: {
        status: 'FAILURE',
        errorSummary: 'Error Encountered (Please provide valid git repository url                                   )',
        errors: [
          {
            reason: 'Unexpected Error',
            message: 'Please provide valid git repository url                                   ',
            code: 450
          }
        ],
        testedAt: 1651880831801,
        lastTestedAt: 0,
        lastConnectedAt: 0
      },
      activityDetails: {
        lastActivityTime: 1651880828720
      },
      harnessManaged: false,
      gitDetails: {
        objectId: null,
        branch: null,
        repoIdentifier: null,
        rootFolder: null,
        filePath: null,
        repoName: null
      },
      entityValidityDetails: {
        valid: true,
        invalidYaml: null
      },
      governanceMetadata: null
    }
  },
  metaData: null,
  correlationId: '5c82f437-16a0-4ce0-8b91-44e12f7cf746'
}
export const GetUseGetConnectorRepoUrlTypeResponse = {
  data: {
    data: {
      connector: {
        name: 'github-repo-url-type',
        identifier: 'githubrepo',
        description: '',
        orgIdentifier: 'default',
        projectIdentifier: 'default',
        tags: {},
        type: 'Github',
        spec: {
          url: 'https://github.com/harness/harness-core-ui',
          validationRepo: null,
          authentication: {
            type: 'Http',
            spec: {
              type: 'UsernameToken',
              spec: {
                username: 'default',
                usernameRef: null,
                tokenRef: 'default'
              }
            }
          },
          apiAccess: null,
          delegateSelectors: [],
          executeOnDelegate: false,
          type: 'Repo'
        }
      },
      createdAt: 1651910747770,
      lastModifiedAt: 1652147896444,
      status: {
        status: 'SUCCESS',
        errorSummary: null,
        errors: null,
        testedAt: 1652375314730,
        lastTestedAt: 0,
        lastConnectedAt: 1652375314730
      },
      activityDetails: {
        lastActivityTime: 1652147896470
      },
      harnessManaged: false,
      gitDetails: {
        objectId: null,
        branch: null,
        repoIdentifier: null,
        rootFolder: null,
        filePath: null,
        repoName: null
      },
      entityValidityDetails: {
        valid: true,
        invalidYaml: null
      },
      governanceMetadata: null
    }
  },
  metaData: null,
  correlationId: '5fc68703-6079-4042-922b-f4f635c6b73a'
}

export const getCICodebaseInputSetFormProps = (formik: any): any => ({
  formik,
  originalPipeline: {
    version: 1,
    name: 'Yaml Simp 4',
    inputs: {
      image: {
        type: 'string',
        desc: 'image name',
        default: 'golang',
        required: true
      }
    },
    repository: {
      connector: 'github'
    },
    stages: [
      {
        name: 'output variable',
        type: 'ci',
        spec: {
          steps: [
            {
              name: 'one test',
              type: 'script',
              spec: {
                image: '<+inputs.image>',
                run: 'export foo=bar',
                shell: 'sh',
                outputs: ['foo']
              }
            },
            {
              name: 'two',
              type: 'script',
              spec: {
                image: 'alpine',
                run: 'echo <+steps.one_test.output.outputVariables.foo>',
                pull: 'always'
              }
            }
          ]
        }
      }
    ]
  }
})
export const gitConnectorMock = {
  data: {
    connector: {
      name: 'github-repo-url-type',
      identifier: 'githubrepo',
      description: '',
      orgIdentifier: 'default',
      projectIdentifier: 'default',
      tags: {},
      type: 'Github',
      spec: {
        url: 'https://github.com/harness/harness-core-ui',
        validationRepo: null,
        authentication: {
          type: 'Http',
          spec: {
            type: 'UsernameToken',
            spec: {
              username: 'default',
              usernameRef: null,
              tokenRef: 'default'
            }
          }
        },
        apiAccess: null,
        delegateSelectors: [],
        executeOnDelegate: false,
        type: 'Repo'
      }
    },
    createdAt: 1651910747770,
    lastModifiedAt: 1652147896444,
    status: {
      status: 'SUCCESS',
      errorSummary: null,
      errors: null,
      testedAt: 1652375314730,
      lastTestedAt: 0,
      lastConnectedAt: 1652375314730
    },
    activityDetails: {
      lastActivityTime: 1652147896470
    },
    harnessManaged: false,
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null
    },
    entityValidityDetails: {
      valid: true,
      invalidYaml: null
    },
    governanceMetadata: null
  }
}
