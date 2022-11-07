/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponseConnectorResponse } from 'services/cd-ng'
import type { ResponsePMSPipelineResponseDTO } from 'services/pipeline-ng'
import type { UseGetReturnData } from '@common/utils/testUtils'

export const mockConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'connectorRef',
        identifier: 'connectorRef',
        description: '',
        tags: {},
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'asd',
              auth: { type: 'UsernamePassword', spec: { username: 'asd', passwordRef: 'account.test1111' } }
            }
          }
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

export const mockConnectorsListResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 100,
    content: [
      {
        connector: {
          name: 'nexus3',
          identifier: 'nexus3',
          description: '',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: [],
          type: 'Nexus3Registry',
          spec: {
            dockerRegistryUrl: 'https://index.docker.io/v2/',
            auth: {
              type: 'UsernamePassword',
              spec: { username: 'aradisavljevic', passwordRef: 'account.dockerAlekspasswordRef' }
            }
          }
        },
        createdAt: 1604593248928,
        lastModifiedAt: 1604593253377,
        status: {
          status: 'SUCCESS',
          errorMessage: '',
          lastTestedAt: 1604593253375,
          lastConnectedAt: 1604593253375
        }
      },
      {
        connector: {
          name: 'harnessimage',
          identifier: 'harnessimage',
          description: 'harnessimage',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: [],
          type: 'Nexus2Registry',
          spec: {
            dockerRegistryUrl: 'https://index.docker.io/v2/',
            auth: {
              type: 'UsernamePassword',
              spec: { username: 'harnessdev', passwordRef: 'account.harnessdevdockerpassword' }
            }
          }
        },
        createdAt: 1604415523887,
        lastModifiedAt: 1604415527763,
        status: {
          status: 'SUCCESS',
          errorMessage: '',
          lastTestedAt: 1604415527762,
          lastConnectedAt: 1604415527762
        }
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'b4a0e6b7-30d7-4688-94ec-9130a3e1b229'
}

export const mockCreateConnectorResponse = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'artifact',
      identifier: 'artifact',
      description: '',
      orgIdentifier: 'default',
      projectIdentifier: 'dummy',
      tags: [],
      type: 'Nexus3Registry',
      spec: {
        dockerRegistryUrl: 'https;//hub.docker.com',
        auth: {
          type: 'UsernamePassword',
          spec: { username: 'testpass', passwordRef: 'account.testpass' }
        }
      }
    },
    createdAt: 1607289652713,
    lastModifiedAt: 1607289652713,
    status: null
  },
  metaData: null,
  correlationId: '0d20f7b7-6f3f-41c2-bd10-4c896bfd76fd'
}

export const mockUpdateConnectorResponse = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'artifact',
      identifier: 'artifact',
      description: '',
      orgIdentifier: 'default',
      projectIdentifier: 'dummy',
      tags: [],
      type: 'Nexus3Registry',
      spec: {
        dockerRegistryUrl: 'https;//hub.docker.com',
        auth: {
          type: 'UsernamePassword',
          spec: { username: 'testpass', passwordRef: 'account.testpass' }
        }
      }
    },
    createdAt: 1607289652713,
    lastModifiedAt: 1607289652713,
    status: null
  },
  metaData: null,
  correlationId: '0d20f7b7-6f3f-41c2-bd10-4c896bfd76fd'
}

export const mockSecretData = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 28,
    pageItemCount: 28,
    pageSize: 100,
    content: [
      {
        secret: {
          type: 'SecretText',
          name: 'testpass',
          identifier: 'testpass',
          tags: {},
          description: '',
          spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline', value: null }
        },
        createdAt: 1606900988388,
        updatedAt: 1606900988388,
        draft: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '7f453609-2037-4539-8571-cd3f270e00e9'
}

export const mockPipelineResponse: UseGetReturnData<ResponsePMSPipelineResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      ngPipeline: {
        pipeline: {
          name: 'testsdfsdf',
          identifier: 'testqqq',
          description: '',
          tags: null,
          variables: null,
          metadata: null
        }
      },
      executionsPlaceHolder: [],
      yamlPipeline:
        'pipeline:\n  name: testsdfsdf\n  identifier: testqqq\n  description: ""\n  stages:\n    - stage:\n        name: asd\n        identifier: asd\n        description: ""\n        type: Deployment\n        spec:\n          service:\n            identifier: asd\n            name: asd\n            description: ""\n            serviceDefinition:\n              type: Kubernetes\n              spec:\n                artifacts:\n                  sidecars: []\n                  primary:\n                    type: Dockerhub\n                    spec:\n                      connectorRef: org.docker\n                      imagePath: asd\n                manifests: []\n                artifactOverrideSets: []\n                manifestOverrideSets: []\n          execution:\n            steps:\n              - step:\n                  name: Rollout Deployment\n                  identifier: rolloutDeployment\n                  type: K8sRollingDeploy\n                  spec:\n                    timeout: 10m\n                    skipDryRun: false\n            rollbackSteps:\n              - step:\n                  name: Rollback Rollout Deployment\n                  identifier: rollbackRolloutDeployment\n                  type: K8sRollingRollback\n                  spec:\n                    timeout: 10m\n          infrastructure:\n            environment:\n              name: qa\n              identifier: qa\n              description: ""\n              type: PreProduction\n            infrastructureDefinition:\n              type: KubernetesDirect\n              spec:\n                connectorRef: <+input>\n                namespace: <+input>\n                releaseName: <+input>\n'
    } as any,
    correlationId: '7a84d477-4549-4026-8113-a02730b4f7c5'
  }
}

export const mockAwsRegionsResponse = {
  data: {
    regionData: {
      resource: []
    }
  }
}

export const mockDockerTagsCallResponse = {
  data: { data: { buildDetailsList: [] } },
  refetch: jest.fn(),
  error: null,
  cancel: jest.fn()
}

export const getYaml = () => `
pipeline:
    name: testSsh
    identifier: testSsh
    allowStageExecutions: false
    projectIdentifier: a1
    orgIdentifier: default
    tags: {}
    stages:
        - stage:
              name: SshTest
              identifier: SshTest
              description: ""
              type: Deployment
              spec:
                  serviceConfig:
                      serviceRef: dascxzcsad
                      serviceDefinition:
                          type: Ssh
                          spec:
                              variables: []
                              manifests:
                                  - manifest:
                                        identifier: qcq
                                        type: K8sManifest
                                        spec:
                                            store:
                                                type: Git
                                                spec:
                                                    connectorRef: sdf
                                                    gitFetchType: Branch
                                                    paths:
                                                        - wce
                                                    repoName: wce
                                                    branch: wc
                                            skipResourceVersioning: false
                              artifacts:
                                  primary:
                                      spec:
                                          connectorRef: harnessImage
                                          imagePath: ew
                                          tag: tag
                                      type: Nexus3Registry
                                  sidecars:
                                      - sidecar:
                                            spec:
                                                connectorRef: asdasd
                                                imagePath: " fqew"
                                                tag: latestTag
                                                registryHostname: gcr.io
                                            identifier: asc
                                            type: Nexus3Registry
                                            sidecars:
                                      - sidecar:
                                            spec:
                                                connectorRef: AWS_IRSA
                                                imagePath: ev
                                                tag: latestTag
                                                region: us-gov-west-1
                                            identifier: vc3rv
                                            type: Ecr
                                      - sidecar:
                                            spec:
                                                connectorRef: harnessImage
                                                imagePath: erv
                                                tag: latestTag
                                            identifier: verv
                                            type: Nexus3Registry
                  infrastructure: {}
              tags: {}`

export const getParams = () => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})
export const mockManifestConnector = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        connector: {
          name: 'git9march',
          identifier: 'git9march',
          description: '',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'Git',
          spec: {
            url: 'https://github.com/wings-software/CG-gitSync',
            validationRepo: null,
            branchName: null,
            delegateSelectors: ['nofartest'],
            executeOnDelegate: true,
            type: 'Http',
            connectionType: 'Repo',
            spec: {
              username: 'harness',
              usernameRef: null,
              passwordRef: 'account.GitToken'
            }
          }
        }
      }
    ]
  }
}

export const mockBuildList = {
  status: 'SUCCESS',
  data: {
    buildDetailsList: [
      {
        tag: 'latesttag'
      },
      {
        tag: 'tagNew'
      }
    ]
  }
}

export const secretMockdata = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 28,
    pageItemCount: 28,
    pageSize: 100,
    content: [
      {
        secret: {
          type: 'SecretText',
          name: 'a1',
          identifier: 'a1',
          tags: {},
          description: '',
          spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline', value: null }
        },
        createdAt: 16069009123,
        updatedAt: 16069009123,
        draft: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'e11'
}

export const connectorListJSON = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 100,
    content: [
      {
        connector: {
          name: 'a1',
          identifier: 'a1',
          description: '',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: [],
          type: 'Nexus3Registry',
          spec: {
            dockerRegistryUrl: 'https://index.docker.io/v2/',
            auth: {
              type: 'UsernamePassword',
              spec: { username: 'a1', passwordRef: 'account.dockerAlekspasswordRef' }
            }
          }
        },
        createdAt: 160459321233,
        lastModifiedAt: 1604593251233,
        status: {
          status: 'SUCCESS',
          errorMessage: '',
          lastTestedAt: 1604593251233,
          lastConnectedAt: 1604593251233
        }
      },
      {
        connector: {
          name: 'harnessimage',
          identifier: 'harnessimage',
          description: 'harnessimage',
          orgIdentifier: null,
          projectIdentifier: null,
          tags: [],
          type: 'Nexus3Registry',
          spec: {
            dockerRegistryUrl: 'https://index.docker.io/v2/',
            auth: {
              type: 'UsernamePassword',
              spec: { username: 'harnessdev', passwordRef: 'account.harnessdevdockerpassword' }
            }
          }
        },
        createdAt: 1604415521233,
        lastModifiedAt: 1604415521233,
        status: {
          status: 'SUCCESS',
          errorMessage: '',
          lastTestedAt: 1604415521233,
          lastConnectedAt: 1604415521323
        }
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: 'e2'
}

export const PipelineMock = {
  state: {
    pipeline: {
      name: 'P1',
      identifier: 'P1',
      description: '',
      stages: [
        {
          stage: {
            name: 'Servic1',
            identifier: 'Servic1',
            description: '',
            type: 'Deployment',
            spec: {
              serviceConfig: {
                service: { identifier: 'svc', name: 'svc', description: '' },
                serviceDefinition: {
                  type: 'Ssh',
                  spec: {
                    artifacts: {
                      sidecars: [
                        {
                          sidecar: {
                            type: 'Dockerhub',
                            identifier: 'sidecar1',
                            spec: {
                              connectorRef: 'account.harnessimage',
                              imagePath: '<+input>',
                              tag: '<+input>'
                            }
                          }
                        }
                      ]
                    },
                    manifests: [
                      {
                        manifest: {
                          identifier: 'gitId',
                          type: 'K8sManifest',
                          spec: {
                            store: {
                              type: 'Git',
                              spec: {
                                connectorRef: 'account.dronegit',
                                gitFetchType: 'Branch',
                                branch: '<+input>',
                                commitId: '',
                                paths: ['specs']
                              }
                            }
                          }
                        }
                      }
                    ],
                    artifactOverrideSets: [],
                    manifestOverrideSets: []
                  }
                }
              },
              infrastructure: {
                environment: { name: 'infra', identifier: 'infra', description: '', type: 'PreProduction' },
                infrastructureDefinition: {
                  type: 'KubernetesDirect',
                  spec: { connectorRef: 'account.adsds', namespace: '<+input>', releaseName: '<+input>' }
                }
              },
              execution: {
                steps: [
                  {
                    step: {
                      name: 'Rollout Deployment',
                      identifier: 'rolloutDeployment',
                      type: 'K8sRollingDeploy',
                      spec: { timeout: '<+input>', skipDryRun: false }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    },
    originalPipeline: {
      name: 'P1',
      identifier: 'P1',
      description: '',
      stages: [
        {
          stage: {
            name: 'Servic1',
            identifier: 'Servic1',
            description: '',
            type: 'Deployment',
            spec: {
              serviceConfig: {
                service: {
                  identifier: '',
                  name: '',
                  description: ''
                },
                serviceDefinition: {
                  type: 'Ssh',
                  spec: {
                    artifacts: {
                      sidecars: [
                        {
                          sidecar: {
                            type: 'Dockerhub',
                            identifier: 'sidecar1',
                            spec: { connectorRef: 'account.harnessimage', imagePath: '<+input>' }
                          }
                        }
                      ],
                      primary: {
                        type: 'Dockerhub',
                        spec: { connectorRef: 'account.dockerAleks', imagePath: '<+input>' }
                      }
                    },
                    manifests: [
                      {
                        manifest: {
                          identifier: 'gitId',
                          type: 'K8sManifest',
                          spec: {
                            store: {
                              type: 'Git',
                              spec: {
                                connectorRef: 'account.dronegit',
                                gitFetchType: 'Branch',
                                branch: '<+input>',
                                commitId: '',
                                paths: ['specs']
                              }
                            }
                          }
                        }
                      }
                    ],
                    artifactOverrideSets: [],
                    manifestOverrideSets: []
                  }
                }
              },
              infrastructure: {
                environment: { name: 'infra', identifier: 'infra', description: '', type: 'PreProduction' },
                infrastructureDefinition: {
                  type: 'KubernetesDirect',
                  spec: { connectorRef: 'account.adsds', namespace: '<+input>', releaseName: '<+input>' }
                }
              },
              execution: {
                steps: [
                  {
                    step: {
                      name: 'Rollout Deployment',
                      identifier: 'rolloutDeployment',
                      type: 'K8sRollingDeploy',
                      spec: { timeout: '<+input>', skipDryRun: false }
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    },
    pipelineIdentifier: 'P1',
    pipelineView: {
      isSplitViewOpen: true,
      isDrawerOpened: false,
      splitViewData: { type: 'StageView' },
      drawerData: { type: 'AddCommand' }
    },
    selectionState: { selectedStageId: 'Servic1' },
    isLoading: false,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isUpdated: true,
    isInitialized: true,
    error: ''
  },
  stepsFactory: { invocationMap: {}, stepBank: {}, stepIconMap: {}, type: 'pipeline-factory' },
  stagesMap: {
    Deployment: {
      name: 'Deploy',
      type: 'Deployment',
      icon: 'pipeline-deploy',
      iconColor: 'var(--pipeline-deploy-stage-color)',
      isApproval: false,
      openExecutionStrategy: true
    },
    ci: {
      name: 'Deploy',
      type: 'ci',
      icon: 'pipeline-build',
      iconColor: 'var(--pipeline-build-stage-color)',
      isApproval: false,
      openExecutionStrategy: false
    },
    Pipeline: {
      name: 'Deploy',
      type: 'Pipeline',
      icon: 'pipeline',
      iconColor: 'var(--pipeline-blue-color)',
      isApproval: false,
      openExecutionStrategy: false
    },
    Custom: {
      name: 'Deploy',
      type: 'Custom',
      icon: 'pipeline-custom',
      iconColor: 'var(--pipeline-custom-stage-color)',
      isApproval: false,
      openExecutionStrategy: false
    },
    Approval: {
      name: 'Deploy',
      type: 'Approval',
      icon: 'pipeline-approval',
      iconColor: 'var(--pipeline-approval-stage-color)',
      isApproval: false,
      openExecutionStrategy: false
    }
  }
}

export const TemplateMock = {
  artifacts: {
    sidecars: [{ sidecar: { identifier: 'sidecar1', type: 'Dockerhub', spec: { imagePath: '<+input>' } } }]
  },
  configFiles: [
    {
      configFile: {
        identifier: 'f1',
        spec: {
          store: {
            type: 'Harness',
            spec: {
              files: ''
            }
          }
        }
      }
    }
  ],
  manifests: [
    {
      manifest: {
        identifier: 'gitId',
        type: 'K8sManifest',
        spec: { store: { type: 'Git', spec: { branch: '<+input>' } } }
      }
    }
  ]
}

export const configFilesDataMock = [
  {
    configFile: {
      identifier: 'f1',
      spec: {
        store: {
          type: 'Harness',
          spec: {
            files: ''
          }
        }
      }
    }
  },
  {
    configFile: {
      identifier: 'e1',
      spec: {
        store: {
          type: 'Harness',
          spec: {
            secretFiles: ''
          }
        }
      }
    }
  }
]

export const mockProps = {
  initialValues: {
    artifacts: {
      metadata: 'artifactmetadata',
      primary: {
        type: 'DockerRegistry' as any,
        spec: {
          connectorRef: 'A',
          tag: 'B',
          imagePath: 'C',
          registryHostname: 'D',
          region: 'E',
          tagRegex: 'F'
        }
      },
      sidecars: [
        {
          sidecar: {
            identifier: 'SidecarECR',
            type: 'Ecr' as any,
            spec: {
              imagePath: '',
              tag: '',
              region: ''
            }
          }
        },
        {
          sidecar: {
            identifier: 'FLSDJF',
            type: 'Ecr' as any,
            spec: {
              connectorRef: '',
              imagePath: '',
              tag: '',
              region: ''
            }
          }
        }
      ]
    },
    manifests: [
      {
        manifest: {
          identifier: 'K8sManifest',
          type: 'K8sManifest' as any,
          spec: {
            store: {
              type: 'K8sManifest',
              spec: {
                connectorRef: '<+input>'
              }
            },
            chartName: '<+input>',
            chartVersion: '<+input>',
            skipResourceVersioning: '<+input>'
          }
        }
      },
      {
        manifest: {
          identifier: 'K8sManifest',
          type: 'K8sManifest' as any,
          spec: {
            store: {
              type: 'Git',
              spec: {
                connectorRef: '<+input>',
                folderPath: '<+input>',
                repoName: '<+input>',
                branch: '<+input>'
              }
            }
          }
        }
      }
    ],
    variables: [
      {
        type: 'String' as any,
        description: 'k8sVariable'
      }
    ]
  },
  customStepProps: {
    stageIdentifier: 'qaStage',
    metadataMap: {
      'step-name': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.K8sDelete.name',
          localName: 'step.K8sDelete.name'
        }
      }
    },
    variablesData: {
      manifests: [
        {
          manifest: {
            identifier: 'K8sManifest',
            type: 'K8sManifest',
            spec: {
              store: {
                type: 'K8sManifest',
                spec: {
                  connectorRef: '<+input>'
                }
              },
              chartName: '<+input>',
              chartVersion: '<+input>',
              skipResourceVersioning: '<+input>'
            }
          }
        },
        {
          manifest: {
            identifier: 'K8sManifest',
            type: 'K8sManifest',
            spec: {
              store: {
                type: 'Git',
                spec: {
                  connectorRef: '<+input>',
                  folderPath: '<+input>',
                  repoName: '<+input>',
                  branch: '<+input>'
                }
              }
            }
          }
        }
      ],
      artifacts: {
        metadata: 'artifactmetadata',
        primary: {
          type: 'Gcr',
          spec: {
            connectorRef: 'A',
            tag: 'B',
            imagePath: 'C',
            registryHostname: 'D',
            region: 'E',
            tagRegex: 'F'
          }
        },
        sidecars: [
          {
            sidecar: {
              identifier: 'Sidecar ECR',
              type: 'Ecr',
              spec: {
                imagePath: '',
                tag: '',
                region: ''
              }
            }
          },
          {
            sidecar: {
              identifier: 'FLSDJF',
              type: 'Ecr',
              spec: {
                connectorRef: '',
                imagePath: '',
                tag: '',
                region: ''
              }
            }
          }
        ]
      },
      variables: [
        {
          type: 'String',
          description: 'k8sVariable'
        }
      ]
    }
  },
  template: {
    artifacts: {
      sidecars: [
        {
          sidecar: {
            identifier: 'Sidecar',
            type: 'Ecr' as any,
            spec: {
              imagePath: '<+input>',
              tag: '<+input>',
              region: '<+input>'
            }
          }
        },
        {
          sidecar: {
            identifier: 'FLSDJF',
            type: 'DockerRegistry' as any,
            spec: {
              connectorRef: '<+input>',
              imagePath: '<+input>',
              tag: '<+input>',
              region: '<+input>'
            }
          }
        }
      ],
      primary: {
        type: 'Gcr' as any,
        spec: {
          connectorRef: '<+input>',
          imagePath: '<+input>',
          tag: '<+input>',
          registryHostname: '<+input>'
        }
      }
    },
    manifests: [
      {
        manifest: {
          identifier: 'K8sManifest',
          type: 'K8sManifest' as any,
          spec: {
            store: {
              type: 'K8sManifest',
              spec: {
                connectorRef: '<+input>'
              }
            }
          }
        }
      },
      {
        manifest: {
          identifier: 'K8sManifest',
          type: 'K8sManifest' as any,
          spec: {
            store: {
              type: 'Git',
              spec: {
                connectorRef: '<+input>',
                folderPath: '<+input>',
                repoName: '<+input>',
                branch: '<+input>'
              }
            }
          }
        }
      }
    ],
    variables: [
      {
        type: 'String' as any,
        description: 'k8sVariable'
      },
      {
        type: 'String' as any,
        description: 'k8sInput'
      }
    ]
  }
}
