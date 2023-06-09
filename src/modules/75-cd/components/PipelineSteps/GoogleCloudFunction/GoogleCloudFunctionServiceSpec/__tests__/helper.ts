/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { ManifestDataType, ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { GoogleCloudFunctionsEnvType, ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

export const updateStageArgGcfFunctionDefinition = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    environmentType: GoogleCloudFunctionsEnvType.GenTwo,
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.GoogleCloudFunctions,
        spec: {
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.GoogleCloudFunctionDefinition,
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

export const updateStageArgGcfFunctionAliasDefinition = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.GoogleCloudFunctions,
        spec: {
          environmentType: GoogleCloudFunctionsEnvType.GenOne,
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: 'GoogleCloudFunctionGenOneDefinition',
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

export const updateStageArgGoogleCloudFunctionDefinitionUpdate = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.GoogleCloudFunctions,
        spec: {
          environmentType: GoogleCloudFunctionsEnvType.GenTwo,
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.GoogleCloudFunctionDefinition,
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

export const updateStageArgGoogleCloudFunctionGenOneDefinitionUpdate = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.GoogleCloudFunctions,
        spec: {
          environmentType: GoogleCloudFunctionsEnvType.GenOne,
          artifacts: { sidecars: [], primary: null },
          manifests: [
            {
              manifest: {
                identifier: 'testidentifier',
                type: ManifestDataType.GoogleCloudFunctionGenOneDefinition,
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

export const updateStageArgGoogleCloudFunctionDefinitionManifestDelete = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.GoogleCloudFunctions,
        spec: {
          environmentType: GoogleCloudFunctionsEnvType.GenTwo,
          artifacts: { sidecars: [], primary: null },
          manifests: []
        }
      }
    }
  }
}

export const updateStageArgGoogleCloudFunctionGenOneDefinitionManifestDelete = {
  name: 'Stage 1',
  identifier: 'Stage_1',
  description: '',
  type: 'Deployment',
  spec: {
    serviceConfig: {
      serviceRef: 'Service_1',
      serviceDefinition: {
        type: ServiceDeploymentType.GoogleCloudFunctions,
        spec: {
          environmentType: GoogleCloudFunctionsEnvType.GenOne,
          artifacts: { sidecars: [], primary: null },
          manifests: []
        }
      }
    }
  }
}

export const updateStageArgForPropagatedStageWithGcfFunctionDefinitionManifest = {
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
              type: ManifestDataType.GoogleCloudFunctionDefinition,
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
                                        type: GoogleCloudFunctionDefinition
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
                                      connectorRef: garServiceConnector
                                      project: cd-play
                                      bucket: aasdad
                                      artifactPath: adas
                                    identifier: vc3rv
                                    type: GoogleCloudStorage
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
        identifier: 'manifest1',
        type: ManifestDataType.GoogleCloudFunctionDefinition,
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

export const gcfManifestTemplateGitStore = {
  manifests: [
    {
      manifest: {
        identifier: 'manifest1',
        type: ManifestDataType.GoogleCloudFunctionDefinition,
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
