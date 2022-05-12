/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@blueprintjs/core'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { Step, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { PipelineContextInterface } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { PipelineStagesProps } from '@pipeline/components/PipelineStages/PipelineStages'

export const getPropsForMinimalStage = (): PipelineStagesProps => ({
  minimal: true,
  stageProps: {
    data: {
      stage: {
        identifier: '',
        name: ''
      }
    },
    onSubmit: jest.fn(),
    onChange: jest.fn()
  },
  children: [
    {
      props: {
        name: '',
        type: 'SECURITY',
        icon: 'security-stage',
        isApproval: false,
        isDisabled: false,
        title: 'Security Stage',
        description: ''
      },
      type: '',
      key: 'security'
    }
  ]
})

export const approvalStageTemplateMock = {
  name: 'Security Stage Test',
  identifier: 'Security_Stage_Test',
  versionLabel: 'v1',
  type: 'Stage',
  projectIdentifier: 'Security_Test',
  orgIdentifier: 'default',
  tags: {},
  spec: {
    type: 'Security',
    spec: {
      execution: {
        steps: [
          {
            step: {
              name: 'Security Step',
              identifier: 'security',
              type: 'Security',
              timeout: '1d',
              spec: {}
            }
          }
        ]
      }
    }
  }
}

class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
}

class StepOne extends Step<Record<string, any>> {
  protected type = StepType.ZeroNorth
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): Record<string, any> {
    return {}
  }
  protected defaultValues = { a: 'a' }
  renderStep(props: StepProps<Record<string, any>>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}

class StepTwo extends Step<Record<string, any>> {
  protected type = StepType.CustomVariable
  protected stepName = 'stepTwo'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): Record<string, any> {
    return {}
  }
  protected defaultValues = { a: 'a' }
  renderStep(props: StepProps<Record<string, any>>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}

const stepsFactory = new StepFactory()
stepsFactory.registerStep(new StepOne())
stepsFactory.registerStep(new StepTwo())

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
  },
  Security: {
    name: 'Deploy',
    type: 'Security',
    icon: 'security-stage',
    iconColor: 'var(--pipeline-custom-stage-color)',
    isApproval: false,
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
            name: 'Security Stage',
            identifier: 'SecurityStage',
            description: '',
            type: 'Security',
            spec: {}
          }
        }
      ]
    },
    originalPipeline: {
      name: 'Pipeline',
      identifier: 'Pipeline',
      description: null,
      tags: null,
      stages: [
        {
          stage: {
            name: 'Security Stage',
            identifier: 'SecurityStage',
            description: '',
            type: 'Security',
            spec: {}
          }
        }
      ]
    },
    pipelineIdentifier: 'Pipeline',
    pipelineView: {
      isSplitViewOpen: true,
      isDrawerOpened: false,
      splitViewData: { type: 'StageView' },
      drawerData: { type: 'AddCommand' }
    },
    selectionState: { selectedStageId: 'Security Stage', selectedStepId: 'securityStep' },
    isLoading: false,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isUpdated: true,
    isInitialized: true,
    error: '',
    templateTypes: {}
  },
  contextType: 'Pipeline',
  stepsFactory,
  stagesMap
}

export const getMockPipelineContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    updatePipeline: jest.fn(),
    updatePipelineView: jest.fn(),
    updateStage: jest.fn().mockResolvedValue({}),
    setSelectedTabId: jest.fn(),
    getStagePathFromPipeline: jest.fn(),
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
    }),
    setTemplateTypes: jest.fn()
  } as any
}
