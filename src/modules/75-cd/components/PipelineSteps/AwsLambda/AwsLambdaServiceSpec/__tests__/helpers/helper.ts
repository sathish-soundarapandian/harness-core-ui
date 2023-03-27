/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { ManifestDataType, ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

export const updateStageArgAwsLambdaFunctionDefinition = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.AwsLambda,
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.AwsLambdaFunctionDefinition,
                spec: {
                  store: {
                    spec: {
                      branch: 'testBranch',
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['test-path']
                    },
                    type: 'Git'
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}

export const updateStageArgAwsLambdaFunctionAliasDefinition = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.AwsLambda,
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.AwsLambdaFunctionAliasDefinition,
                spec: {
                  store: {
                    spec: {
                      branch: 'testBranch',
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['test-path']
                    },
                    type: 'Git'
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}

export const updateStageArgFunctionDefinitionUpdate = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.AwsLambda,
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.AwsLambdaFunctionDefinition,
                spec: {
                  store: {
                    spec: {
                      branch: 'testBranch',
                      connectorRef: 'Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['test-path']
                    },
                    type: 'Git'
                  }
                }
              }
            },
            {
              manifest: {
                identifier: 'AwsLambdaFunctionAliasDefinition_Manifest',
                type: ManifestDataType.AwsLambdaFunctionAliasDefinition,
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['awsLambda/functionAliasDefinition.json'],
                      branch: 'function_alias_definition'
                    }
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}

export const updateStageArgAwsLambdaFunctionDefinitionManifestDelete = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.AwsLambda,
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'AwsLambdaFunctionAliasDefinition_Manifest',
                type: ManifestDataType.AwsLambdaFunctionAliasDefinition,
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'account.Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['awsLambda/functionAliasDefinition.json'],
                      branch: 'function_alias_definition'
                    }
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}

export const updateStageArgAwsLambdaFunctionAliasDefinitionManifestDelete = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.AwsLambda,
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'AwsLambdaFunctionDefinition_Manifest',
                type: ManifestDataType.AwsLambdaFunctionDefinition,
                spec: {
                  store: {
                    type: 'Git',
                    spec: {
                      connectorRef: 'Git_CTR',
                      gitFetchType: 'Branch',
                      paths: ['awsLambda/functionDefinition.json'],
                      branch: 'function_definition'
                    }
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}

export const updateStageArgForPropagatedStageWithAwsLambdaFunctionDefinitionManifest = {
  name: 'Stage 2',
  identifier: 'Stage_2',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      useFromStage: {
        stage: 'Stage_1'
      },
      stageOverrides: {
        artifacts: { sidecars: [], primary: null },
        manifests: [
          {
            manifest: {
              identifier: 'testidentifier',
              type: ManifestDataType.AwsLambdaFunctionDefinition,
              spec: {
                store: {
                  spec: {
                    branch: 'testBranch',
                    connectorRef: 'Git_CTR',
                    gitFetchType: 'Branch',
                    paths: ['test-path']
                  },
                  type: 'Git'
                }
              }
            }
          }
        ]
      }
    }
  }
}

export const getYaml = (): string => `
pipeline:
    name: testK8s
    identifier: testK8s
    allowStageExecutions: false
    projectIdentifier: Kapil
    orgIdentifier: default
    tags: {}
    stages:
        - stage:
              name: K8sTest
              identifier: K8sTest
              description: ""
              type: Deployment
              spec:
                  serviceConfig:
                      serviceRef: dascxzcsad
                      serviceDefinition:
                          type: Kubernetes
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
                                      connectorRef: AWS_IRSA
                                      imagePath: ev
                                      tag: latestTag
                                      region: us-gov-west-1
                                    identifier: vc3rv
                                    type: Ecr
                  infrastructure: {}
              tags: {}`

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

export const initialManifestRuntimeValuesGitStore = {
  manifests: [
    {
      manifest: {
        identifier: 'AwsLambdaFunctionDefinition_Manifest',
        type: ManifestDataType.AwsLambdaFunctionDefinition,
        spec: {
          store: {
            type: ManifestStoreMap.Git,
            spec: {
              connectorRef: '',
              branch: '',
              paths: ''
            }
          }
        }
      }
    },
    {
      manifest: {
        identifier: 'AwsLambdaFunctionAliasDefinition_Manifest',
        type: ManifestDataType.AwsLambdaFunctionAliasDefinition,
        spec: {
          store: {
            type: ManifestStoreMap.Git,
            spec: {
              connectorRef: '',
              branch: '',
              paths: ''
            }
          }
        }
      }
    }
  ]
}

export const awsLambdaManifestTemplateGitStore = {
  manifests: [
    {
      manifest: {
        identifier: 'AwsLambdaFunctionDefinition_Manifest',
        type: ManifestDataType.AwsLambdaFunctionDefinition,
        spec: {
          store: {
            type: ManifestStoreMap.Git,
            spec: {
              connectorRef: RUNTIME_INPUT_VALUE,
              branch: RUNTIME_INPUT_VALUE,
              paths: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    },
    {
      manifest: {
        identifier: 'AwsLambdaFunctionAliasDefinition_Manifest',
        type: ManifestDataType.AwsLambdaFunctionAliasDefinition,
        spec: {
          store: {
            type: ManifestStoreMap.Git,
            spec: {
              connectorRef: RUNTIME_INPUT_VALUE,
              branch: RUNTIME_INPUT_VALUE,
              paths: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    }
  ]
}
