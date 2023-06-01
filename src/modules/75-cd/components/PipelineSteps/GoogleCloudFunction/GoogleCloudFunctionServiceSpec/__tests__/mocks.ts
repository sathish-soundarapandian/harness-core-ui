/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MultiTypeInputType } from '@harness/uicore'

import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { GoogleCloudFunctionsEnvType, ServiceDeploymentType } from '@pipeline/utils/stageHelpers'

/**
 * GCF related
 */
const stateWithGcfDeploymentType = {
  state: {
    pipeline: {
      name: 'Pipeline 1',
      identifier: 'Pipeline_1',
      description: '',
      tags: {},
      stages: [
        {
          stage: {
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
                    manifests: []
                  }
                }
              }
            }
          }
        }
      ]
    },
    selectionState: { selectedStageId: 'Stage_1' }
  }
}

const stateWithGcfGen1DeployType = {
  state: {
    pipeline: {
      name: 'Pipeline 1',
      identifier: 'Pipeline_1',
      description: '',
      tags: {},
      stages: [
        {
          stage: {
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
        }
      ]
    },
    selectionState: { selectedStageId: 'Stage_1' }
  }
}

export const pipelineContextGcf = {
  ...stateWithGcfDeploymentType,
  getStageFromPipeline: jest.fn(() => {
    return { stage: stateWithGcfDeploymentType.state.pipeline.stages[0], parent: undefined }
  }),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  updateStage: jest.fn()
} as any

export const pipelineContextGcfGen1 = {
  ...stateWithGcfGen1DeployType,
  getStageFromPipeline: jest.fn(() => {
    return { stage: stateWithGcfGen1DeployType.state.pipeline.stages[0], parent: undefined }
  }),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  updateStage: jest.fn()
} as any

const stateWithGcfManifests = {
  state: {
    pipeline: {
      name: 'Pipeline 1',
      identifier: 'Pipeline_1',
      description: '',
      tags: {},
      stages: [
        {
          stage: {
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
                          identifier: 'manifest1',
                          type: ManifestDataType.GoogleCloudFunctionDefinition,
                          spec: {
                            store: {
                              type: 'Git',
                              spec: {
                                connectorRef: 'account.GitConnectoriNZb4BTqGE',
                                gitFetchType: 'Branch',
                                paths: ['src/main'],
                                branch: 'master'
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
        },
        {
          stage: {
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
                        identifier: 'FunctionDefinition_Manifest',
                        type: ManifestDataType.GoogleCloudFunctionDefinition,
                        spec: {
                          store: {
                            type: 'Git',
                            spec: {
                              connectorRef: 'Git_CTR',
                              gitFetchType: 'Branch',
                              paths: ['gcf/functionDefinition.json'],
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
      ]
    },
    selectionState: { selectedStageId: 'Stage_1' }
  }
}

const stateWithGcfGen1Manifest = {
  state: {
    pipeline: {
      name: 'Pipeline 1',
      identifier: 'Pipeline_1',
      description: '',
      tags: {},
      stages: [
        {
          stage: {
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
                          identifier: 'GcfManifestGenOne',
                          type: ManifestDataType.GoogleCloudFunctionGenOneDefinition,
                          spec: {
                            store: {
                              type: 'Git',
                              spec: {
                                connectorRef: 'account.GitConnectoriNZb4BTqGE',
                                gitFetchType: 'Branch',
                                paths: ['src/main'],
                                branch: 'master'
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
        },
        {
          stage: {
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
                        identifier: 'FunctionDefinition_Manifest',
                        type: ManifestDataType.GoogleCloudFunctionDefinition,
                        spec: {
                          store: {
                            type: 'Git',
                            spec: {
                              connectorRef: 'Git_CTR',
                              gitFetchType: 'Branch',
                              paths: ['gcf/functionDefinition.json'],
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
      ]
    },
    selectionState: { selectedStageId: 'Stage_1' }
  }
}
export const pipelineContextGcfManifests = {
  ...stateWithGcfManifests,
  getStageFromPipeline: jest.fn((stageId: string) => {
    const stage = stateWithGcfManifests.state.pipeline.stages.find(currStage => currStage.stage.identifier === stageId)
    const parentStageId = stage?.stage.spec.serviceConfig.useFromStage?.stage
    const parentStage = stateWithGcfManifests.state.pipeline.stages.find(
      currStage => currStage.stage.identifier === parentStageId
    )
    return {
      stage: stage,
      parent: parentStage
    }
  }),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  updateStage: jest.fn()
} as any

export const pipelineContextGcfGen1Manifest = {
  ...stateWithGcfGen1Manifest,
  getStageFromPipeline: jest.fn((stageId: string) => {
    const stage = stateWithGcfGen1Manifest.state.pipeline.stages.find(
      currStage => currStage.stage.identifier === stageId
    )
    const parentStageId = stage?.stage.spec.serviceConfig.useFromStage?.stage
    const parentStage = stateWithGcfGen1Manifest.state.pipeline.stages.find(
      currStage => currStage.stage.identifier === parentStageId
    )
    return {
      stage: stage,
      parent: parentStage
    }
  }),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  updateStage: jest.fn()
} as any

export const getProjectsResponse = {
  status: 'SUCCESS',
  data: {
    projects: [
      {
        id: 'cd-play',
        name: ' cd-play'
      }
    ]
  },
  metaData: null,
  correlationId: 'd69e8176-03ae-464e-a973-5ca0cf08aca3'
}
