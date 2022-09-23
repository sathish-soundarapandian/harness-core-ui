/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'

import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { PipelineContextInterface } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

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
            name: 'd3',
            identifier: 'd3',
            description: '',
            type: 'Deployment',
            spec: {
              deploymentType: 'Ssh',
              service: {
                serviceRef: 'sshwinrm'
              },
              environment: {
                environmentRef: 'testssh1',
                deployToAll: false,
                infrastructureDefinitions: [
                  {
                    identifier: 'infrassh'
                  }
                ]
              },
              execution: {
                steps: [
                  {
                    step: {
                      type: 'Command',
                      name: 'd3',
                      identifier: 'd3',
                      spec: {
                        onDelegate: false,
                        environmentVariables: [],
                        outputVariables: [],
                        commandUnits: [
                          {
                            identifier: 's2',
                            name: 's2',
                            type: 'Copy',
                            spec: {
                              sourceType: 'Artifact',
                              destinationPath: 's'
                            }
                          }
                        ]
                      },
                      timeout: '10m'
                    }
                  }
                ],
                rollbackSteps: []
              }
            },
            tags: {},
            failureStrategies: [
              {
                onFailure: {
                  errors: ['AllErrors'],
                  action: {
                    type: 'StageRollback'
                  }
                }
              }
            ],
            delegateSelectors: '<+input>',
            when: {
              pipelineStatus: 'Success',
              condition: '<+input>'
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

export const runtimeFnArg = {
  name: 'd3',
  identifier: 'd3',
  description: '',
  type: 'Deployment',
  spec: {
    deploymentType: 'Ssh',
    service: {
      serviceRef: 'sshwinrm'
    },
    environment: {
      environmentRef: 'testssh1',
      deployToAll: false,
      infrastructureDefinitions: [
        {
          identifier: 'infrassh'
        }
      ]
    },
    execution: {
      steps: [
        {
          step: {
            type: 'Command',
            name: 'd3',
            identifier: 'd3',
            spec: {
              onDelegate: false,
              environmentVariables: [],
              outputVariables: [],
              commandUnits: [
                {
                  identifier: 's2',
                  name: 's2',
                  type: 'Copy',
                  spec: {
                    sourceType: 'Artifact',
                    destinationPath: 's'
                  }
                }
              ]
            },
            timeout: '10m'
          }
        }
      ],
      rollbackSteps: []
    }
  },
  tags: {},
  failureStrategies: [
    {
      onFailure: {
        errors: ['AllErrors'],
        action: {
          type: 'StageRollback'
        }
      }
    }
  ],
  delegateSelectors: '<+input>',
  when: {
    pipelineStatus: 'Success',
    condition: '<+input>'
  }
}
