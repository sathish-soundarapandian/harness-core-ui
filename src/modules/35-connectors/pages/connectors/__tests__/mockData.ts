/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const connectorsData = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 6,
    pageItemCount: 6,
    pageSize: 10,
    content: [
      {
        connector: {
          name: 'AWS',
          identifier: 'AWSX',
          description: '',
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          tags: {},
          type: 'Aws',
          spec: {
            credential: {
              crossAccountAccess: null,
              type: 'InheritFromDelegate',
              spec: { delegateSelector: 'vardan-bansal-mbp' }
            }
          }
        },
        gitDetails: {
          branch: 'master',
          objectId: '1111',
          repoIdentifier: 'repoOne'
        },
        createdAt: 1608697269523,
        lastModifiedAt: 1608697269523,
        status: null,
        harnessManaged: false
      },
      {
        connector: {
          name: 'Git CTR',
          identifier: 'Git_CTR',
          description: 'To connect to Git',
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          tags: { git: '' },
          type: 'Git',
          spec: {
            url: 'https://github.com/vardanbansal-harness/vscode-yaml.git',
            type: 'Http',
            connectionType: 'Repo',
            spec: { username: 'admin', passwordRef: 'account.sec1' },
            gitSync: { enabled: false, customCommitAttributes: null, syncEnabled: false }
          }
        },
        gitDetails: {
          branch: 'dev',
          objectId: '1112',
          repoIdentifier: 'repoTwo'
        },
        createdAt: 1608679004757,
        lastModifiedAt: 1608679004757,
        status: null,
        harnessManaged: false
      },
      {
        connector: {
          name: 'Sample',
          identifier: 'SampleX',
          description: '',
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          tags: {},
          type: 'Git',
          spec: {
            url: 'https://github.com/vardanbansal-harness/vscode-yaml.git',
            type: 'Http',
            connectionType: 'Repo',
            spec: { username: 'admin', passwordRef: 'account.sec1' },
            gitSync: { enabled: false, customCommitAttributes: null, syncEnabled: false }
          }
        },
        createdAt: 1608678936902,
        lastModifiedAt: 1608679013406,
        status: null,
        harnessManaged: false
      },
      {
        connector: {
          name: 'XYZDocker',
          identifier: 'XYZDockerX',
          description: '',
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          tags: {},
          type: 'DockerRegistry',
          spec: {
            dockerRegistryUrl: 'www.google.com',
            providerType: null,
            auth: { type: 'UsernamePassword', spec: { username: 'admin', passwordRef: 'account.dockerconnpass' } }
          }
        },
        createdAt: 1608040997054,
        lastModifiedAt: 1608040997054,
        status: { status: 'FAILURE', errorMessage: null, lastTestedAt: 0, lastConnectedAt: 0 },
        harnessManaged: false
      },
      {
        connector: {
          name: 'Docker CTR',
          identifier: 'DockerCTRX',
          description: '',
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          tags: {},
          type: 'DockerRegistry',
          spec: {
            dockerRegistryUrl: 'www.docker.com',
            providerType: null,
            auth: { type: 'UsernamePassword', spec: { username: 'admin', passwordRef: 'account.dockerconnpass' } }
          }
        },
        createdAt: 1607924647071,
        lastModifiedAt: 1607924647071,
        status: { status: 'SUCCESS', errorMessage: null, lastTestedAt: 0, lastConnectedAt: 0 },
        harnessManaged: false
      },
      {
        connector: {
          description: '',
          identifier: 'Nexus_Connector',
          name: 'NexusConnector',
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          spec: {
            auth: { type: 'UsernamePassword', spec: { username: 'hgj', passwordRef: 'account.appdcorrectsecret' } },
            nexusServerUrl: 'dbhgj',
            version: '2.x'
          },
          tags: {},
          type: 'Nexus',
          createdAt: 1610106601445,
          harnessManaged: false,
          lastModifiedAt: 1610198427730,
          status: {
            errorSummary: null,
            errors: null,
            lastConnectedAt: 1610198427714,
            lastTestedAt: 1610198427714,
            status: 'SUCCESS',
            testedAt: 161019842771
          }
        }
      },
      {
        connector: {
          name: 'KubernetesCTR',
          identifier: 'Kubernetes CTRX',
          description: '',
          orgIdentifier: undefined,
          projectIdentifier: undefined,
          tags: { qa: '', test: '' },
          type: 'K8sCluster',
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                masterUrl: 'sample.google.com',
                auth: { type: 'UsernamePassword', spec: { username: 'admin', passwordRef: 'account.kubconnpass' } }
              }
            }
          }
        },
        createdAt: 1607924578377,
        lastModifiedAt: 1608040385164,
        status: { status: 'SUCCESS', errorMessage: null, lastTestedAt: 0, lastConnectedAt: 0 },
        harnessManaged: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '1b5c9329-b315-4e3c-b318-e4ee881282ce'
}

export const catalogueData = {
  status: 'SUCCESS',
  data: {
    catalogue: [
      { category: 'CLOUD_PROVIDER', connectors: ['Gcp', 'Aws', 'K8sCluster'] },
      {
        category: 'SECRET_MANAGER',
        connectors: [
          'Cyberark',
          'GcpKms',
          'CustomSecretManager',
          'Vault',
          'Azurevault',
          'AwsSecretManager',
          'Local',
          'AwsKms'
        ]
      },
      { category: 'CONNECTOR', connectors: [] },
      { category: 'ARTIFACTORY', connectors: ['DockerRegistry', 'Nexus', 'Artifactory'] },
      { category: 'CODE_REPO', connectors: ['Git'] },
      { category: 'MONITORING', connectors: ['AppDynamics', 'Splunk'] },
      { category: 'TICKETING', connectors: ['Jira'] }
    ]
  },
  metaData: null,
  correlationId: '0fe40db0-e383-4593-b7dc-c40b4b3f56d6'
}

export const statisticsMockData = {
  status: 'SUCCESS',
  data: { typeStats: [], statusStats: [] },
  metaData: null,
  correlationId: 'e65f0c82-1ba1-4f44-ba9a-9344b734b54c'
}

export const ManualK8s = {
  status: 'SUCCESS' as const,
  data: {
    currentPage: 1,
    empty: false,
    content: [
      {
        connector: {
          description: 'This description is for K8s',
          identifier: 'k8sId',
          name: 'K8sName',
          type: 'K8sCluster',
          tags: {},
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                masterUrl: 'master url',
                auth: {
                  type: 'UsernamePassword',
                  spec: {
                    passwordRef: 'account.secretname',
                    username: 'user name'
                  }
                }
              }
            }
          }
        },
        status: {
          errorMessage: 'Unable to connect to the server',
          lastConnectedAt: 0,
          lastTestedAt: 1601199008081,
          status: 'FAILURE'
        },
        createdAt: 1601198999531,
        lastModifiedAt: 1601199008088
      }
    ],
    total: 1
  },
  metaData: null,
  correlationId: 'correlationId'
}

export const K8WithInheritFromDelegate = {
  data: {
    connector: {
      name: 'k8 With Tags',
      identifier: 'k8WithTags',
      description: 'asasas',
      orgIdentifier: undefined,
      projectIdentifier: undefined,
      tags: { connectot: 'dx' },
      type: 'K8sCluster',
      spec: { delegateSelectors: ['primary', 'secondary'], credential: { type: 'InheritFromDelegate' } }
    },
    createdAt: 1612855114667,
    lastModifiedAt: 1613484012059,
    status: {
      status: 'FAILURE',
      errorSummary: 'Unexpected Error',
      errors: [
        {
          reason: 'Unexpected Error',
          message: 'Something went wrong on our end. Please contact Harness Support.',
          code: 450
        }
      ],
      testedAt: 1613484012267,
      lastTestedAt: 0,
      lastConnectedAt: 0
    },
    activityDetails: { lastActivityTime: 1613484012084 },
    harnessManaged: false
  },
  metaData: null,
  correlationId: '1db0858d-fac0-43d7-9d0a-0e4fcaa785e5'
}

export const PDC = {
  data: {
    connector: {
      name: 'PDC',
      identifier: 'PDCX',
      description: '',
      orgIdentifier: undefined,
      projectIdentifier: undefined,
      tags: {},
      type: 'Pdc',
      spec: {
        hosts: [
          {
            hostname: 'test hostname',
            hostAttributes: {}
          }
        ],
        delegateSelectors: []
      }
    },
    createdAt: 1612855114667,
    lastModifiedAt: 1613484012059,
    status: {
      status: 'FAILURE',
      errorSummary: 'Unexpected Error',
      errors: [
        {
          reason: 'Unexpected Error',
          message: 'Something went wrong on our end. Please contact Harness Support.',
          code: 450
        }
      ],
      testedAt: 1613484012267,
      lastTestedAt: 0,
      lastConnectedAt: 0
    },
    activityDetails: { lastActivityTime: 1613484012084 },
    harnessManaged: false
  },
  metaData: null,
  correlationId: '1db0858d-fac0-43d7-9d0a-0e4fcaa785e5'
}

export const GithubRepo = {
  connector: {
    name: 'github',
    identifier: 'github-identifier',
    description: '',
    orgIdentifier: 'default',
    projectIdentifier: 'connectors',
    tags: {},
    type: 'Github',
    spec: {
      url: 'git@github.com:wings-software/sample-k8s-manifests.git',
      validationRepo: null,
      authentication: {
        type: 'Ssh',
        spec: {
          sshKeyRef: 'githubkey'
        }
      },
      apiAccess: null,
      delegateSelectors: [],
      executeOnDelegate: true,
      type: 'Repo'
    }
  },
  createdAt: 1659427218440,
  lastModifiedAt: 1659427218399,
  status: {
    status: 'SUCCESS',
    errorSummary: null,
    errors: null,
    testedAt: 1659441287276,
    lastTestedAt: 0,
    lastConnectedAt: 1659441287276
  },
  activityDetails: {
    lastActivityTime: 1659427218574
  },
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
  entityValidityDetails: {
    valid: true,
    invalidYaml: null
  },
  governanceMetadata: null
}

export const GitHttp = {
  status: 'SUCCESS' as const,
  data: {
    currentPage: 1,
    empty: false,
    content: [
      {
        connector: {
          description: 'This description is for Git',
          identifier: 'GitHttpId',
          name: 'GitHttpName',
          type: 'Git',
          tags: { tag1: '' },
          spec: {
            connectionType: 'REPO',
            type: 'Http',
            url: 'url',
            spec: {
              passwordRef: 'account.secretname',
              username: 'user name'
            }
          }
        },
        status: {
          errorMessage: 'Unable to connect to the server',
          lastConnectedAt: 0,
          lastTestedAt: 1601199008081,
          status: 'FAILURE'
        },
        createdAt: 1601198999531,
        lastModifiedAt: 1601199008088
      }
    ],
    total: 1
  },
  metaData: null,
  correlationId: 'correlationId'
}

export const Docker = {
  status: 'SUCCESS' as const,
  data: {
    currentPage: 1,
    empty: false,
    content: [
      {
        connector: {
          description: 'This description is for Docker',
          identifier: 'DockerId',
          name: 'DockerName',
          type: 'DockerRegistry',
          tags: { tag1: '' },
          spec: {
            dockerRegistryUrl: 'docker Registry url',
            auth: {
              type: 'UsernamePassword',
              spec: {
                passwordRef: 'account.secretname',
                username: 'user name'
              }
            }
          }
        },
        status: {
          errorMessage: 'Unable to connect to the server',
          lastConnectedAt: 0,
          lastTestedAt: 1601199008081,
          status: 'FAILURE'
        },
        createdAt: 1601198999531,
        lastModifiedAt: 1601199008088
      }
    ],
    total: 1
  },
  metaData: null,
  correlationId: 'correlationId'
}
export const ActiveDocker = {
  status: 'SUCCESS' as const,
  data: {
    currentPage: 1,
    empty: false,
    content: [
      {
        connector: {
          description: 'This description is for Docker',
          identifier: 'DockerId',
          name: 'DockerName',
          type: '"DockerRegistry"',
          tags: { tag1: '' },
          spec: {
            dockerRegistryUrl: 'docker Registry url',
            auth: {
              type: 'UsernamePassword',
              spec: {
                passwordRef: 'account.secretname',
                username: 'user name'
              }
            }
          }
        },
        status: {
          errorMessage: null,
          lastConnectedAt: 1601199008081,
          lastTestedAt: 1601199008081,
          status: 'SUCCESS'
        },
        createdAt: 1601198999531,
        lastModifiedAt: 1601199008088
      }
    ],
    total: 1
  },
  metaData: null,
  correlationId: 'correlationId'
}

export const Vault = {
  status: 'SUCCESS' as const,
  data: {
    currentPage: 1,
    empty: false,
    content: [
      {
        connector: {
          description: 'This description is for Vault',
          identifier: 'VaultId',
          name: 'VaultName',
          type: 'Vault',
          tags: { tag1: '' },
          spec: {
            default: false
          }
        },
        status: {
          errorMessage: null,
          lastConnectedAt: 1601199008081,
          lastTestedAt: 1601199008081,
          status: 'SUCCESS'
        },
        createdAt: 1601198999531,
        lastModifiedAt: 1601199008088
      }
    ],
    total: 1
  },
  metaData: null,
  correlationId: 'correlationId'
}
export const VaultWithIamAMS = {
  status: 'SUCCESS' as const,
  data: {
    currentPage: 1,
    empty: false,
    content: [
      {
        connector: {
          description: 'This description is for Vault',
          identifier: 'VaultId',
          name: 'VaultNameWithAMS',
          type: 'Vault',
          tags: { tag1: '' },
          spec: {
            accessType: 'AWS_IAM',
            authToken: null,
            awsRegion: 'us-gov-east-1',
            basePath: '/',
            default: false,
            delegateSelectors: [],
            readOnly: false,
            renewalIntervalMinutes: 10,
            secretEngineManuallyConfigured: true,
            secretEngineName: 'dfdfdf',
            secretEngineVersion: 2,
            secretId: null,
            useAwsIam: true,
            useVaultAgent: false,
            vaultAwsIamRole: 'test',
            vaultUrl: 'https://vaultqa.harness.io',
            xvaultAwsIamServerId: 'account.awiamdockerpwd'
          }
        },
        status: {
          errorMessage: null,
          lastConnectedAt: 1601199008081,
          lastTestedAt: 1601199008081,
          status: 'SUCCESS'
        },
        createdAt: 1601198999531,
        lastModifiedAt: 1601199008088
      }
    ],
    total: 1
  },
  metaData: null,
  correlationId: 'correlationId'
}

export const GCP = {
  status: 'SUCCESS' as const,
  data: {
    currentPage: 1,
    empty: false,
    content: [
      {
        connector: {
          name: 'GCP for demo',
          identifier: 'GCP_for_demo',
          description: 'Details',
          tags: { GCP: '', demo: '' },
          type: 'Gcp',
          spec: { credential: { type: 'ManualConfig', spec: { secretKeyRef: 'account.GCP' } } }
        },
        status: {
          errorMessage: null,
          lastConnectedAt: 1601199008081,
          lastTestedAt: 1601199008081,
          status: 'SUCCESS'
        },
        createdAt: 1601198999531,
        lastModifiedAt: 1601199008088
      }
    ],
    total: 1
  }
}
export const AWS = {
  status: 'SUCCESS' as const,
  data: {
    currentPage: 1,
    empty: false,
    content: [
      {
        connector: {
          name: 'AWS demo',
          identifier: 'AWS_demo',
          description: 'connector description',
          tags: { demo: '', test: '' },
          type: 'Aws',
          spec: {
            credential: {
              crossAccountAccess: { crossAccountRoleArn: 'dummyRoleARN', externalId: '12345' },
              type: 'InheritFromDelegate',
              spec: { delegateSelector: 'primary' }
            }
          }
        },
        status: {
          errorMessage: null,
          lastConnectedAt: 1601199008081,
          lastTestedAt: 1601199008081,
          status: 'SUCCESS'
        },
        createdAt: 1601198999531,
        lastModifiedAt: 1601199008088
      }
    ],
    total: 1
  }
}
export const Nexus = {
  status: 'SUCCESS' as const,
  data: {
    currentPage: 1,
    empty: false,
    content: [
      {
        connector: {
          name: 'Nexus one',
          identifier: 'Nexus_one',
          description: 'testing nexus connector',
          tags: {},
          type: 'Nexus',
          spec: {
            nexusServerUrl: 'https://nexus2.harness.io',
            version: '3.x',
            auth: { type: 'UsernamePassword', spec: { username: 'dev', passwordRef: 'account.NexusPassword' } }
          }
        },
        status: {
          errorMessage: null,
          lastConnectedAt: 1601199008081,
          lastTestedAt: 1601199008081,
          status: 'SUCCESS'
        },
        createdAt: 1601198999531,
        lastModifiedAt: 1601199008088
      }
    ],
    total: 1
  }
}
export const Artifactory = {
  status: 'SUCCESS' as const,
  data: {
    currentPage: 1,
    empty: false,
    content: [
      {
        connector: {
          name: 'Artifacory One',
          identifier: 'Artifacory_One',
          description: '',
          tags: {},
          type: 'Artifactory',
          spec: {
            artifactoryServerUrl: 'https://test-repo.blackducksoftware.com/artifactory/',
            auth: {
              type: 'UsernamePassword',
              spec: { username: 'harness-dev', passwordRef: 'account.connectorSecret' }
            }
          }
        },
        status: {
          errorMessage: null,
          lastConnectedAt: 1601199008081,
          lastTestedAt: 1601199008081,
          status: 'SUCCESS'
        },
        createdAt: 1601198999531,
        lastModifiedAt: 1601199008088
      }
    ],
    total: 1
  }
}

export const AwsCodeCommit = {
  status: 'SUCCESS' as const,
  data: {
    currentPage: 1,
    empty: false,
    content: [
      {
        connector: {
          name: 'aws-code-commit',
          identifier: 'awscodecommit',
          description: '',
          orgIdentifier: 'default',
          projectIdentifier: 'project1',
          tags: {},
          type: 'Codecommit',
          spec: {
            url: 'test',
            authentication: {
              type: 'HTTPS',
              spec: {
                type: 'AWSCredentials',
                spec: {
                  accessKey: 'accessKey',
                  accessKeyRef: null,
                  secretKeyRef: 'account.fdfdere'
                }
              }
            },
            delegateSelectors: [],
            type: 'Repo'
          }
        },
        status: {
          errorMessage: null,
          lastConnectedAt: 1601199008081,
          lastTestedAt: 1601199008081,
          status: 'SUCCESS'
        },
        createdAt: 1601198999531,
        lastModifiedAt: 1601199008088
      }
    ],
    total: 1
  }
}

export const filters = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 100,
    content: [
      {
        name: 'DockerOnly',
        identifier: 'DockerOnly',
        orgIdentifier: undefined,
        projectIdentifier: undefined,
        filterProperties: {
          connectorNames: [],
          connectorIdentifiers: [],
          description: '',
          types: ['DockerRegistry'],
          categories: null,
          connectivityStatuses: null,
          inheritingCredentialsFromDelegate: null,
          tags: {},
          filterType: 'Connector'
        },
        filterVisibility: 'EveryOne'
      },
      {
        name: 'AWSOnly',
        identifier: 'AWSOnly',
        orgIdentifier: undefined,
        projectIdentifier: undefined,
        filterProperties: {
          connectorNames: [],
          connectorIdentifiers: [],
          description: '',
          types: ['Aws'],
          categories: null,
          connectivityStatuses: null,
          inheritingCredentialsFromDelegate: null,
          tags: {},
          filterType: 'Connector'
        },
        filterVisibility: 'OnlyCreator'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'c7a1b79e-6675-417f-8506-1c1522181f75'
}

export const connectorWithGitData = {
  connector: {
    name: 'docker',
    identifier: 'docker',
    description: 'sample',
    orgIdentifier: 'default',
    projectIdentifier: 'vbgitproject',
    tags: {},
    type: 'DockerRegistry',
    spec: {
      dockerRegistryUrl: 'https://registry.hub.docker.com/v2/',
      providerType: 'DockerHub',
      auth: { type: 'Anonymous' },
      delegateSelectors: []
    }
  },
  createdAt: 1234567890,
  lastModifiedAt: 1234567890,
  status: {
    status: 'SUCCESS',
    testedAt: 134567890,
    lastTestedAt: 0,
    lastConnectedAt: 1234567890
  },
  activityDetails: { lastActivityTime: 1234567890 },
  harnessManaged: false,
  gitDetails: {
    objectId: 'objectId',
    branch: 'main',
    repoIdentifier: 'repoId',
    rootFolder: 'vbsetup/.harness/',
    filePath: 'docker.yaml'
  }
}
