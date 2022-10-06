/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import type { PipelineContextInterface } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
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
                  type: ServiceDeploymentType.CustomDeployment,
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
