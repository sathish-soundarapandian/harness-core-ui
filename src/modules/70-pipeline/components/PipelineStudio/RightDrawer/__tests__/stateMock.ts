/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypesWithRunTime} from '@harness/uicore';
import { MultiTypeInputType } from '@harness/uicore'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { PipelineContextInterface } from '../../PipelineContext/PipelineContext'
import { DrawerTypes } from '../../PipelineContext/PipelineActions'

const stateMock = {
  pipeline: {
    name: 'stage1',
    identifier: 'stage1',
    projectIdentifier: 'Milos2',
    orgIdentifier: 'CV',
    tags: {},
    stages: [
      {
        stage: {
          name: 's1',
          identifier: 's1',
          description: '',
          type: 'CI',
          spec: {
            cloneCodebase: false,
            infrastructure: {
              type: 'KubernetesDirect',
              spec: {
                connectorRef: 'account.yogesh',
                namespace: 'harness-delegate'
              }
            },
            execution: {
              steps: [
                {
                  step: {
                    type: 'Run',
                    name: 'step1',
                    identifier: 'step1',
                    spec: {
                      connectorRef: 'harnessImage',
                      image: 'alpine',
                      command: "echo 'run'",
                      privileged: false
                    }
                  }
                }
              ]
            },
            serviceDependencies: [
              {
                identifier: 'step1',
                name: '',
                description: '',
                spec: {}
              }
            ]
          }
        }
      }
    ]
  },
  originalPipeline: {
    name: 'stage1',
    identifier: 'stage1',
    projectIdentifier: 'Milos2',
    orgIdentifier: 'CV',
    tags: {},
    stages: [
      {
        stage: {
          name: 's1',
          identifier: 's1',
          description: '',
          type: 'CI',
          spec: {
            cloneCodebase: false,
            infrastructure: {
              type: 'KubernetesDirect',
              spec: {
                connectorRef: 'account.yogesh',
                namespace: 'harness-delegate'
              }
            },
            execution: {
              steps: [
                {
                  step: {
                    type: 'Run',
                    name: 'step1',
                    identifier: 'step1',
                    spec: {
                      connectorRef: 'harnessImage',
                      image: 'alpine',
                      command: "echo 'run'",
                      privileged: false
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]
  },
  pipelineIdentifier: '-1',
  pipelineView: {
    isSplitViewOpen: true,
    isDrawerOpened: true,
    splitViewData: {
      type: 'StageView'
    },
    drawerData: {
      type: 'StepConfig',
      data: {
        stepConfig: {
          node: {
            type: 'Run',
            name: 'step1',
            identifier: 'step1',
            spec: {
              connectorRef: 'harnessImage',
              image: 'alpine',
              command: "echo 'run'",
              privileged: false
            }
          },
          stepsMap: new Map([
            [
              'step3',
              {
                type: 'Run',
                name: 'step3',
                identifier: 'step1',
                spec: {
                  connectorRef: 'harnessImage',
                  image: 'alpine',
                  command: "echo 'run'",
                  privileged: false
                }
              }
            ],
            [
              'step2',
              {
                type: 'Run',
                name: 'step2',
                identifier: 'step2',
                spec: {
                  connectorRef: 'harnessImage',
                  image: 'alpine',
                  command: "echo 'run'",
                  privileged: false
                }
              }
            ]
          ]),
          isStepGroup: false,
          addOrEdit: 'edit'
        }
      }
    }
  },
  schemaErrors: false,
  gitDetails: {},
  storeMetadata: {},
  isLoading: false,
  isBEPipelineUpdated: false,
  isDBInitialized: true,
  isUpdated: true,
  isInitialized: true,
  selectionState: {
    selectedStageId: 's1',
    selectedStepId: 'step1'
  },
  templateTypes: {},
  templateServiceData: {},
  error: ''
}

export const getPipelineContextMock = (): PipelineContextInterface => ({
  state: stateMock as any,
  contextType: 'Pipeline',
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  stepsFactory: {
    getStep: (type: string) => {
      switch (type) {
        case 'Run':
          return {
            icon: 'run-step',
            name: 'Configure Run Step',
            type: 'Run'
          }
      }
    },
    getStepDescription: (type: string) => {
      return 'Awesome description for step ' + type
    },
    getStepAdditionalInfo: (type: string) => {
      return 'Awesome additional info for step ' + type
    },
    getStepIsHarnessSpecific: (type: string) => {
      if (type) {
        return true
      }
    },
    getStepIconColor: () => undefined,
    getStepData: () => ({
      icon: 'run-step',
      name: 'Configure Run Step',
      type: 'Run'
    }),
    getStepIcon: () => 'run-step',
    getStepName: () => 'Configure Run Step'
  } as any,
  stagesMap: {},
  setSchemaErrorView: () => undefined,
  isReadonly: false,
  view: 'VISUAL',
  scope: Scope.PROJECT,
  updateGitDetails: () => new Promise<void>(() => undefined),
  updatePipelineStoreMetadata: () => new Promise<void>(() => undefined),
  updateEntityValidityDetails: () => new Promise<void>(() => undefined),
  setView: () => void 0,
  runPipeline: () => undefined,
  // eslint-disable-next-line react/display-name
  renderPipelineStage: jest.fn(),
  fetchPipeline: () => new Promise<void>(() => undefined),
  updatePipelineView: jest.fn(),
  updateStage: jest.fn().mockResolvedValue({}),
  getStageFromPipeline: () => ({ stage: stateMock.pipeline.stages[0] as any, parent: undefined }),
  setYamlHandler: () => undefined,
  updatePipeline: jest.fn(),
  pipelineSaved: () => undefined,
  deletePipelineCache: () => new Promise<void>(() => undefined),
  setSelectedStageId: (_selectedStageId: string | undefined) => undefined,
  setSelectedStepId: (_selectedStepId: string | undefined) => undefined,
  setSelectedSectionId: (_selectedSectionId: string | undefined) => undefined,
  setSelection: jest.fn(),
  getStagePathFromPipeline: () => '',
  setTemplateTypes: jest.fn(),
  setTemplateIcons: jest.fn(),
  setTemplateServiceData: jest.fn(),
  setIntermittentLoading: jest.fn(),
  setValidationUuid: jest.fn()
})

export const updateStageFnArg1 = {
  description: '',
  identifier: 's1',
  name: 's1',
  spec: {
    cloneCodebase: false,
    execution: {
      steps: [
        {
          step: {
            description: 'test desc',
            identifier: 'step1',
            name: 'step1',
            spec: {
              command: "echo 'run'",
              connectorRef: 'harnessImage',
              image: 'alpine',
              privileged: false
            },
            type: 'Run'
          }
        }
      ]
    },
    infrastructure: {
      spec: {
        connectorRef: 'account.yogesh',
        namespace: 'harness-delegate'
      },
      type: 'KubernetesDirect'
    },
    serviceDependencies: [
      {
        description: '',
        identifier: 'step1',
        name: '',
        spec: {}
      }
    ]
  },
  type: 'CI'
}

export const updatePipelineViewFnArg1 = {
  drawerData: {
    data: {
      stepConfig: {
        addOrEdit: 'edit',
        isStepGroup: false,
        node: {
          description: 'test desc',
          identifier: 'step1',
          name: 'step1',
          spec: {
            command: "echo 'run'",
            connectorRef: 'harnessImage',
            image: 'alpine',
            privileged: false
          },
          type: 'Run'
        },
        stepsMap: new Map([
          [
            'step3',
            {
              type: 'Run',
              name: 'step3',
              identifier: 'step1',
              spec: {
                connectorRef: 'harnessImage',
                image: 'alpine',
                command: "echo 'run'",
                privileged: false
              }
            }
          ],
          [
            'step2',
            {
              type: 'Run',
              name: 'step2',
              identifier: 'step2',
              spec: {
                connectorRef: 'harnessImage',
                image: 'alpine',
                command: "echo 'run'",
                privileged: false
              }
            }
          ]
        ])
      }
    },
    type: 'StepConfig'
  },
  isDrawerOpened: true,
  isSplitViewOpen: true,
  splitViewData: {
    type: 'StageView'
  }
}

export const closeDrawerPayload = {
  ...stateMock.pipelineView,
  isDrawerOpened: false,
  drawerData: {
    type: DrawerTypes.AddStep
  }
}

export const mockBarriers = [
  {
    identifier: 'demo',
    name: 'demo',
    stages: [
      {
        name: 'demoStageName'
      },
      {
        name: 'demoStageName2'
      }
    ]
  },
  {
    identifier: 'demo2',
    name: 'dem2',
    stages: []
  }
]

export const getProvisionerPipelineContextMock = (): PipelineContextInterface => {
  const state = {
    pipeline: {
      name: 'pip provisioner',
      identifier: 'pip_provisioner',
      projectIdentifier: 'testrr18',
      orgIdentifier: 'default',
      tags: {},
      stages: [
        {
          stage: {
            name: 's1',
            identifier: 's1',
            description: '',
            type: 'Deployment',
            spec: {
              deploymentType: 'Kubernetes',
              service: {
                serviceRef: '<+input>',
                serviceInputs: '<+input>'
              },
              environment: {
                environmentRef: '<+input>',
                deployToAll: false,
                provisioner: {
                  steps: [
                    {
                      step: {
                        type: 'ShellScriptProvision',
                        name: 'ssp',
                        identifier: 'ssp',
                        spec: {
                          source: {
                            type: 'Inline',
                            spec: {
                              script: '<+input>'
                            }
                          },
                          environmentVariables: []
                        },
                        timeout: '<+input>',
                        when: '<+input>'
                      }
                    }
                  ]
                },
                environmentInputs: '<+input>',
                serviceOverrideInputs: '<+input>',
                infrastructureDefinitions: '<+input>'
              },
              execution: {
                steps: [
                  {
                    step: {
                      name: 'Rollout Deployment',
                      identifier: 'rolloutDeployment',
                      type: 'K8sRollingDeploy',
                      timeout: '10m',
                      spec: {
                        skipDryRun: false,
                        pruningEnabled: false
                      }
                    }
                  }
                ],
                rollbackSteps: [
                  {
                    step: {
                      name: 'Rollback Rollout Deployment',
                      identifier: 'rollbackRolloutDeployment',
                      type: 'K8sRollingRollback',
                      timeout: '10m',
                      spec: {
                        pruningEnabled: false
                      }
                    }
                  }
                ]
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
            ]
          }
        }
      ]
    },
    originalPipeline: {
      name: 'pip provisioner',
      identifier: 'pip_provisioner',
      projectIdentifier: 'testrr18',
      orgIdentifier: 'default',
      tags: {},
      stages: [
        {
          stage: {
            name: 's1',
            identifier: 's1',
            description: '',
            type: 'Deployment',
            spec: {
              deploymentType: 'Kubernetes',
              service: {
                serviceRef: '<+input>',
                serviceInputs: '<+input>'
              },
              environment: {
                environmentRef: '<+input>',
                deployToAll: false,
                provisioner: {
                  steps: [
                    {
                      step: {
                        type: 'ShellScriptProvision',
                        name: 'ssp',
                        identifier: 'ssp',
                        spec: {
                          source: {
                            type: 'Inline',
                            spec: {
                              script: '<+input>'
                            }
                          },
                          environmentVariables: []
                        },
                        timeout: '<+input>',
                        when: '<+input>'
                      }
                    }
                  ]
                },
                environmentInputs: '<+input>',
                serviceOverrideInputs: '<+input>',
                infrastructureDefinitions: '<+input>'
              },
              execution: {
                steps: [
                  {
                    step: {
                      name: 'Rollout Deployment',
                      identifier: 'rolloutDeployment',
                      type: 'K8sRollingDeploy',
                      timeout: '10m',
                      spec: {
                        skipDryRun: false,
                        pruningEnabled: false
                      }
                    }
                  }
                ],
                rollbackSteps: [
                  {
                    step: {
                      name: 'Rollback Rollout Deployment',
                      identifier: 'rollbackRolloutDeployment',
                      type: 'K8sRollingRollback',
                      timeout: '10m',
                      spec: {
                        pruningEnabled: false
                      }
                    }
                  }
                ]
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
            ]
          }
        }
      ]
    },
    pipelineIdentifier: 'pip_provisioner',
    pipelineView: {
      isSplitViewOpen: true,
      isDrawerOpened: true,
      isYamlEditable: false,
      splitViewData: {
        type: 'StageView'
      },
      drawerData: {
        type: 'ProvisionerStepConfig',
        data: {
          stepConfig: {
            node: {
              type: 'ShellScriptProvision',
              name: 'ssp',
              identifier: 'ssp',
              spec: {
                source: {
                  type: 'Inline',
                  spec: {
                    script: '<+input>'
                  }
                },
                environmentVariables: []
              },
              timeout: '<+input>',
              when: '<+input>'
            },
            stepsMap: new Map(),
            isStepGroup: false,
            addOrEdit: 'edit',
            hiddenAdvancedPanels: ['preRequisites']
          }
        }
      },
      isRollbackToggled: true
    },
    schemaErrors: false,
    storeMetadata: {
      storeType: 'INLINE'
    },
    gitDetails: {},
    entityValidityDetails: {
      valid: true
    },
    templateTypes: {},
    templateIcons: {},
    templateServiceData: {},
    resolvedCustomDeploymentDetailsByRef: {},
    isLoading: false,
    isIntermittentLoading: false,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isDBInitializationFailed: false,
    isUpdated: false,
    modules: ['cd', 'pms'],
    isInitialized: true,
    selectionState: {
      selectedStageId: 's1',
      selectedSectionId: 'ENVIRONMENT'
    },
    error: '',
    yamlSchemaErrorWrapper: {},
    validationUuid: 'validationUuid',
    yamlHandler: {}
  } as any

  return {
    ...getPipelineContextMock(),
    state,
    stepsFactory: {
      getStep: (type: string) => {
        switch (type) {
          case 'ShellScriptProvision':
            return {
              icon: 'script',
              name: 'Shell Script Provision',
              type: 'ShellScriptProvision'
            }
        }
      },
      getStepDescription: (type: string) => {
        return 'Awesome description for step ' + type
      },
      getStepAdditionalInfo: (type: string) => {
        return 'Awesome additional info for step ' + type
      },
      getStepIsHarnessSpecific: (type: string) => {
        if (type) {
          return true
        }
      },
      getStepIconColor: () => undefined,
      getStepData: () => ({
        icon: 'script',
        name: 'Shell Script Provision',
        type: 'ShellScriptProvision'
      }),
      getStepIcon: () => 'script',
      getStepName: () => 'Shell Script Provision'
    } as any,
    getStageFromPipeline: () => ({ stage: state.pipeline.stages[0] as any, parent: undefined })
  }
}

const pipelineContextMock = getPipelineContextMock()
export default pipelineContextMock
