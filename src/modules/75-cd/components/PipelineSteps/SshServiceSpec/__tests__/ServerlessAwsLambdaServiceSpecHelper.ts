/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { IconName, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { PipelineContextInterface } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { Module, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import type { ServiceSpec } from 'services/cd-ng'

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

export const getPipelineContextMockData = (
  isLoading = false,
  gitDetails?: any,
  isReadonly = false,
  isUpdated = false
) => ({
  state: {
    pipeline: {
      name: 'Pipeline 1',
      identifier: 'pipeline_1',
      description: null,
      tags: null,
      stages: [
        {
          stage: {
            name: 'Stage 1',
            identifier: 'stage_1',
            description: '',
            type: 'Deploy',
            spec: {
              serviceConfig: {
                serviceDefinition: {
                  type: ServiceDeploymentType.ServerlessAwsLambda,
                  spec: {}
                }
              }
            }
          }
        }
      ]
    },
    originalPipeline: {
      name: 'Pipeline 1',
      identifier: 'pipeline_1',
      description: null,
      tags: null,
      stages: [
        {
          stage: {
            name: 'Stage 1',
            identifier: 'stage_1',
            description: '',
            type: 'Deploy',
            spec: {}
          }
        }
      ]
    },
    pipelineIdentifier: 'pipeline_1',
    pipelineView: {
      isSplitViewOpen: true,
      isDrawerOpened: false,
      splitViewData: { type: 'StageView' },
      drawerData: { type: 'AddCommand' }
    },
    selectionState: { selectedStageId: 'stage_1' },
    isLoading,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isUpdated,
    isInitialized: true,
    error: '',
    gitDetails,
    entityValidityDetails: { valid: true }
  },
  isReadonly,
  stepsFactory: stepFactory,
  stagesMap
})

export const getDummyPipelineCanvasContextValue = (params: any): PipelineContextInterface => {
  const { isLoading, gitDetails, isReadonly, isUpdated } = params
  const data = getPipelineContextMockData(isLoading, gitDetails, isReadonly, isUpdated)
  return {
    ...data,
    updatePipeline: jest.fn(),
    updatePipelineView: jest.fn(),
    updateStage: jest.fn().mockResolvedValue({}),
    setSelectedTabId: jest.fn(),
    getStagePathFromPipeline: jest.fn(),
    renderPipelineStage: jest.fn(),
    setSelectedStageId: jest.fn(),
    fetchPipeline: jest.fn(),
    setView: jest.fn(),
    setSchemaErrorView: jest.fn(),
    deletePipelineCache: jest.fn(),
    setSelectedSectionId: jest.fn(),
    getStageFromPipeline: jest.fn(() => {
      return { stage: data.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}

export const getInvalidYaml = (): string => `pipeline:
    stages:
      - stage:
          spec:
              serviceConfig:
              serviceRef: Service_1
                  serviceDefinition:
                      type: ServerlessAwsLambda
                      spec:
                        `

export const getYaml = (): string => `pipeline:
    stages:
        - stage:
              spec:
                  serviceConfig:
                      serviceRef: Service_1
                      serviceDefinition:
                          type: ServerlessAwsLambda
                          spec:
                              artifacts:
                                  primary:
                                      spec:
                                          connectorRef: <+input>
                                          artifactDirectory: /
                                          artifactPath: todolist
                                          repository: lambda
                                          repositoryFormat: generic
                                      type: ArtifactoryRegistry
                              manifests:
                                  - manifest:
                                        identifier: test_manifest
                                        type: ServerlessAwsLambda
                                        spec:
                                            store:
                                                type: Git
                                                spec:
                                                    connectorRef: Git_Sync_Chetan_Git_Conn
                                                    gitFetchType: Branch
                                                    paths:
                                                        - test1
                                                    branch: main`

export const getParams = (): PipelinePathProps & { module: Module } => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})

export const getTemplateWithArtifactPath = (): ServiceSpec => ({
  artifacts: {
    primary: {
      type: 'ArtifactoryRegistry',
      spec: {
        connectorRef: RUNTIME_INPUT_VALUE,
        artifactDirectory: RUNTIME_INPUT_VALUE,
        artifactPath: RUNTIME_INPUT_VALUE,
        repository: RUNTIME_INPUT_VALUE
      }
    }
  }
})

export const getTemplateWithArtifactPathFilter = (): ServiceSpec => ({
  artifacts: {
    primary: {
      type: 'ArtifactoryRegistry',
      spec: {
        connectorRef: RUNTIME_INPUT_VALUE,
        artifactDirectory: RUNTIME_INPUT_VALUE,
        artifactPathFilter: RUNTIME_INPUT_VALUE,
        repository: RUNTIME_INPUT_VALUE
      }
    }
  }
})

export const getTemplateWithManifestFields = (): ServiceSpec => ({
  manifests: [
    {
      manifest: {
        identifier: 'test_manifest',
        type: 'ServerlessAwsLambda',
        spec: {
          store: {
            spec: {
              connectorRef: RUNTIME_INPUT_VALUE,
              folderPath: RUNTIME_INPUT_VALUE,
              branch: RUNTIME_INPUT_VALUE,
              paths: RUNTIME_INPUT_VALUE
            }
          }
        }
      }
    }
  ]
})

export const initialValues = {
  artifacts: {
    primary: {
      type: 'ArtifactoryRegistry',
      spec: {
        connectorRef: 'connector',
        artifactDirectory: '/',
        artifactPath: 'hello-world.zip',
        repository: 'lambda'
      }
    }
  },
  manifests: [
    {
      manifest: {
        identifier: 'test_manifest',
        type: 'ServerlessAwsLambda',
        spec: {
          store: {
            spec: {
              connectorRef: '',
              folderPath: '',
              branch: '',
              paths: ''
            }
          }
        }
      }
    }
  ]
}
