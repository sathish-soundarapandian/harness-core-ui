/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MultiTypeInputType } from '@harness/uicore'

const stateWithECSDeploymentType = {
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
                service: {
                  identifier: 'Service_1',
                  name: 'Service 1',
                  description: ''
                },
                serviceDefinition: {
                  type: 'ECS',
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

export const pipelineContextECS = {
  ...stateWithECSDeploymentType,
  getStageFromPipeline: jest.fn(() => {
    return { stage: stateWithECSDeploymentType.state.pipeline.stages[0], parent: undefined }
  }),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  updateStage: jest.fn()
} as any

const stateWithECSManifests = {
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
                service: {
                  identifier: 'Service_1',
                  name: 'Service 1',
                  description: ''
                },
                serviceDefinition: {
                  type: 'ECS',
                  spec: {
                    artifacts: { sidecars: [], primary: null },
                    manifests: [
                      {
                        manifest: {
                          identifier: 'TaskDefinition_Manifest',
                          type: 'EcsTaskDefinition',
                          spec: {
                            store: {
                              type: 'Git',
                              spec: {
                                connectorRef: 'Git_CTR',
                                gitFetchType: 'Branch',
                                paths: ['ecs/taskdef.json'],
                                branch: 'task_definition'
                              }
                            }
                          }
                        }
                      },
                      {
                        manifest: {
                          identifier: 'ServiceDefinition_Manifest',
                          type: 'EcsServiceDefinition',
                          spec: {
                            store: {
                              type: 'Git',
                              spec: {
                                connectorRef: 'account.Git_CTR',
                                gitFetchType: 'Branch',
                                paths: ['ecs/servicedef.json'],
                                branch: 'service_definition'
                              }
                            }
                          }
                        }
                      },
                      {
                        manifest: {
                          identifier: 'ScallingPolicy_Manifest',
                          type: 'EcsScalingPolicyDefinition',
                          spec: {
                            store: {
                              type: 'Git',
                              spec: {
                                connectorRef: 'account.Git_CTR',
                                gitFetchType: 'Branch',
                                paths: ['ecs/scalingpolicy.json'],
                                branch: 'scalling_policy'
                              }
                            }
                          }
                        }
                      },
                      {
                        manifest: {
                          identifier: 'ScalableTarget_Manifest',
                          type: 'EcsScalableTargetDefinition',
                          spec: {
                            store: {
                              type: 'Git',
                              spec: {
                                connectorRef: 'account.Git_CTR',
                                gitFetchType: 'Branch',
                                paths: ['ecs/scalabletarget.json'],
                                branch: 'scalable_target'
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
                        identifier: 'TaskDefinition_Manifest',
                        type: 'EcsTaskDefinition',
                        spec: {
                          store: {
                            type: 'Git',
                            spec: {
                              connectorRef: 'Git_CTR',
                              gitFetchType: 'Branch',
                              paths: ['ecs/taskdef.json'],
                              branch: 'task_definition'
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

export const pipelineContextECSManifests = {
  ...stateWithECSManifests,
  getStageFromPipeline: jest.fn((stageId: string) => {
    const stage = stateWithECSManifests.state.pipeline.stages.find(currStage => currStage.stage.identifier === stageId)
    const parentStageId = stage?.stage.spec.serviceConfig.useFromStage?.stage
    const parentStage = stateWithECSManifests.state.pipeline.stages.find(
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
