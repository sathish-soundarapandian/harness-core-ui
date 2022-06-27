/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'

import type { ResponseMapServiceDefinitionTypeListExecutionStrategyType, ResponseString } from 'services/cd-ng'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { PipelineContextInterface } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

export const executionStrategies: ResponseMapServiceDefinitionTypeListExecutionStrategyType = {
  status: 'SUCCESS',
  data: {
    Kubernetes: ['Rolling', 'BlueGreen', 'Canary', 'Default']
  },
  correlationId: '83b66188-8117-41f9-8829-7ca76950db1d'
}

export const rollingYaml: ResponseString = {
  status: 'SUCCESS',
  data: 'failureStrategies:\n  - onFailure:\n      errors:\n        - AllErrors\n      action:\n        type: StageRollback\nspec:\n  execution:\n    steps:\n      - step:\n          name: "Rollout Deployment"\n          identifier: rolloutDeployment\n          type: K8sRollingDeploy\n          timeout: 10m\n          spec:\n            skipDryRun: false\n    rollbackSteps:\n      - step:\n          name: "Rollback Rollout Deployment"\n          identifier: rollbackRolloutDeployment\n          type: K8sRollingRollback\n          timeout: 10m\n          spec: {}\n',
  correlationId: 'f5d1824d-5957-4395-a831-6333605dd779'
}

export const blueGreenYaml: ResponseString = {
  status: 'SUCCESS',
  data: 'failureStrategies:\n  - onFailure:\n      errors:\n        - AllErrors\n      action:\n        type: StageRollback\nspec:\n  execution:\n    steps:\n      - step:\n          name: "Stage Deployment"\n          identifier: stageDeployment\n          type: K8sBlueGreenDeploy\n          timeout: 10m\n          spec:\n            skipDryRun: false\n      - step:\n          name: "Swap primary with stage service"\n          identifier: bgSwapServices\n          type: K8sBGSwapServices\n          timeout: 10m\n          spec:\n            skipDryRun: false\n    rollbackSteps:\n      - step:\n          name: "Swap primary with stage service"\n          identifier: rollbackBgSwapServices\n          type: K8sBGSwapServices\n          timeout: 10m\n          spec:\n            skipDryRun: false',
  correlationId: 'bad26870-87bf-4a1d-8970-48ad01576241'
}

export const canaryYaml: ResponseString = {
  status: 'SUCCESS',
  data: 'failureStrategies:\n  - onFailure:\n      errors:\n        - AllErrors\n      action:\n        type: StageRollback\nspec:\n  execution:\n    steps:\n      - stepGroup:\n          name: Canary Deployment\n          identifier: canaryDepoyment\n          steps:\n            - step:\n                name: "Canary Deployment"\n                identifier: canaryDeployment\n                type: K8sCanaryDeploy\n                timeout: 10m\n                spec:\n                  instanceSelection:\n                    type: Count\n                    spec:\n                      count: 1\n                  skipDryRun: false\n            - step:\n                name: "Canary Delete"\n                identifier: canaryDelete\n                type: K8sCanaryDelete\n                timeout: 10m\n                spec: {}\n          rollbackSteps:\n            - step:\n                name: "Canary Delete"\n                identifier: rollbackCanaryDelete\n                type: K8sCanaryDelete\n                timeout: 10m\n                spec: {}\n      - stepGroup:\n          name: Primary Deployment\n          identifier: primaryDepoyment\n          steps:\n            - step:\n                name: "Rolling Deployment"\n                identifier: rollingDeployment\n                type: K8sRollingDeploy\n                timeout: 10m\n                spec:\n                  skipDryRun: false\n          rollbackSteps:\n            - step:\n                name: "Rolling Rollback"\n                identifier: rollingRollback\n                type: K8sRollingRollback\n                timeout: 10m\n                spec: {}',
  correlationId: '638372f3-9ed8-42a7-9662-7ff177290f87'
}

export const defaultYaml: ResponseString = {
  status: 'SUCCESS',
  data: 'failureStrategies:\n  - onFailure:\n      errors:\n        - AllErrors\n      action:\n        type: StageRollback',
  correlationId: 'd4478910-e651-4681-a21c-b0967dcd162f'
}
export const basicYaml: ResponseString = {
  status: 'SUCCESS',
  data: 'failureStrategies:\n  - onFailure:\n      errors:\n        - AllErrors\n      action:\n        type: StageRollback\nspec:\n  execution:\n    steps:\n      - step:\n          name: "Helm Deployment"\n          identifier: helmDeployment\n          type: HelmDeploy\n          timeout: 10m\n          spec:\n            skipDryRun: false\n    rollbackSteps:\n      - step:\n          name: "Helm Rollback"\n          identifier: helmRollback\n          type: HelmRollback\n          timeout: 10m\n          spec: {}',
  correlationId: 'd4478910-e651-4681-a21c-b0967dcd162f'
}

class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
}

const stepFactory = new StepFactory()

const stagesMap = {
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
    icon: 'approval-stage-icon',
    iconColor: 'var(--pipeline-approval-stage-color)',
    isApproval: true,
    openExecutionStrategy: false
  }
}

export const pipelineContextMock = {
  state: {
    pipeline: {
      name: 'Pipeline',
      identifier: 'Pipeline',
      description: null,
      tags: null,
      stages: [
        {
          stage: {
            name: 'stage 1',
            identifier: 'stage_1',
            description: '',
            type: '',
            spec: {
              execution: {
                steps: [
                  {
                    identifier: 'rolloutDeployment',
                    name: 'Rollout Deployment',
                    type: 'K8sRollingDeploy',
                    spec: { skipDryRun: false }
                  }
                ]
              }
            }
          }
        }
      ]
    },
    originalPipeline: {
      name: 'Pipeline',
      identifier: 'Pipeline',
      description: null,
      tags: null,
      stages: []
    },
    pipelineIdentifier: 'Pipeline',
    pipelineView: {
      isSplitViewOpen: true,
      isDrawerOpened: true,
      splitViewData: { type: 'StageView' },
      drawerData: { type: 'ExecutionStrategy', hasBackdrop: true }
    },
    selectionState: { selectedSectionId: 'EXECUTION', selectedStageId: 'stage_1', selectedStepId: undefined },
    isLoading: false,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isUpdated: true,
    isInitialized: true,
    error: ''
  },
  stepsFactory: stepFactory,
  stagesMap
}

export const getDummyPipelineContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    updatePipeline: jest.fn(),
    updatePipelineView: jest.fn(),
    updateStage: jest.fn().mockImplementation(() => {
      return Promise.resolve()
    }),
    setSelectedTabId: jest.fn(),
    getStagePathFromPipeline: jest.fn(),
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}

export const rollingUpdateStageFnArg = {
  identifier: 'stage_1',
  name: 'stage 1',
  spec: {
    serviceConfig: { serviceDefinition: { type: 'Kubernetes' }, serviceRef: 'service_3' },
    execution: {
      steps: [
        {
          step: {
            identifier: 'rolloutDeployment',
            name: 'Rollout Deployment',
            spec: {
              skipDryRun: false
            },
            timeout: '10m',
            type: 'K8sRollingDeploy'
          }
        }
      ],
      rollbackSteps: [
        {
          step: {
            identifier: 'rollbackRolloutDeployment',
            name: 'Rollback Rollout Deployment',
            spec: {},
            timeout: '10m',
            type: 'K8sRollingRollback'
          }
        }
      ]
    }
  },
  type: 'Deployment',
  failureStrategies: [
    {
      onFailure: {
        action: { type: 'StageRollback' },
        errors: ['AllErrors']
      }
    }
  ]
}

export const blueGreenUpdateStageFnArg = {
  identifier: 'stage_1',
  name: 'stage 1',
  spec: {
    serviceConfig: { serviceDefinition: { type: 'Kubernetes' }, serviceRef: 'service_3' },
    execution: {
      steps: [
        {
          step: {
            identifier: 'stageDeployment',
            name: 'Stage Deployment',
            spec: {
              skipDryRun: false
            },
            timeout: '10m',
            type: 'K8sBlueGreenDeploy'
          }
        },
        {
          step: {
            identifier: 'bgSwapServices',
            name: 'Swap primary with stage service',
            spec: {
              skipDryRun: false
            },
            timeout: '10m',
            type: 'K8sBGSwapServices'
          }
        }
      ],
      rollbackSteps: [
        {
          step: {
            identifier: 'rollbackBgSwapServices',
            name: 'Swap primary with stage service',
            spec: {
              skipDryRun: false
            },
            timeout: '10m',
            type: 'K8sBGSwapServices'
          }
        }
      ]
    }
  },
  type: 'Deployment',
  failureStrategies: [
    {
      onFailure: {
        action: {
          type: 'StageRollback'
        },
        errors: ['AllErrors']
      }
    }
  ]
}

export const canaryUpdateStageFnArg = {
  identifier: 'stage_1',
  name: 'stage 1',
  spec: {
    serviceConfig: { serviceDefinition: { type: 'Kubernetes' }, serviceRef: 'service_3' },
    execution: {
      steps: [
        {
          stepGroup: {
            identifier: 'canaryDepoyment',
            name: 'Canary Deployment',
            rollbackSteps: [
              {
                step: {
                  identifier: 'rollbackCanaryDelete',
                  name: 'Canary Delete',
                  spec: {},
                  timeout: '10m',
                  type: 'K8sCanaryDelete'
                }
              }
            ],
            steps: [
              {
                step: {
                  identifier: 'canaryDeployment',
                  name: 'Canary Deployment',
                  spec: {
                    instanceSelection: {
                      spec: {
                        count: 1
                      },
                      type: 'Count'
                    },
                    skipDryRun: false
                  },
                  timeout: '10m',
                  type: 'K8sCanaryDeploy'
                }
              },
              {
                step: {
                  identifier: 'canaryDelete',
                  name: 'Canary Delete',
                  spec: {},
                  timeout: '10m',
                  type: 'K8sCanaryDelete'
                }
              }
            ]
          }
        },
        {
          stepGroup: {
            identifier: 'primaryDepoyment',
            name: 'Primary Deployment',
            rollbackSteps: [
              {
                step: {
                  identifier: 'rollingRollback',
                  name: 'Rolling Rollback',
                  spec: {},
                  timeout: '10m',
                  type: 'K8sRollingRollback'
                }
              }
            ],
            steps: [
              {
                step: {
                  identifier: 'rollingDeployment',
                  name: 'Rolling Deployment',
                  spec: {
                    skipDryRun: false
                  },
                  timeout: '10m',
                  type: 'K8sRollingDeploy'
                }
              }
            ]
          }
        }
      ]
    }
  },
  type: 'Deployment',
  failureStrategies: [
    {
      onFailure: {
        action: {
          type: 'StageRollback'
        },
        errors: ['AllErrors']
      }
    }
  ]
}

export const defaultUpdateStageFnArg = {
  identifier: 'stage_1',
  name: 'stage 1',
  spec: {
    serviceConfig: { serviceDefinition: { type: 'Kubernetes' }, serviceRef: 'service_3' },
    execution: {
      steps: [
        {
          step: {
            identifier: 'rolloutDeployment',
            name: 'Rollout Deployment',
            spec: {
              skipDryRun: false
            },
            timeout: '10m',
            type: 'K8sRollingDeploy'
          }
        }
      ],
      rollbackSteps: [
        {
          step: {
            identifier: 'rollbackRolloutDeployment',
            name: 'Rollback Rollout Deployment',
            spec: {},
            timeout: '10m',
            type: 'K8sRollingRollback'
          }
        }
      ]
    }
  },
  type: 'Deployment',
  failureStrategies: [
    {
      onFailure: {
        action: {
          type: 'StageRollback'
        },
        errors: ['AllErrors']
      }
    }
  ]
}
