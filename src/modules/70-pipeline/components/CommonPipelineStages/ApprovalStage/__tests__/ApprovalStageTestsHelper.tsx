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
import type { TemplateSummaryResponse } from 'services/template-ng'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import type { ApprovalStageMinimalModeProps } from '../types'

export const getPropsForMinimalStage = (): PipelineStagesProps<ApprovalStageMinimalModeProps> => ({
  minimal: true,
  stageProps: {
    data: {
      stage: {
        identifier: '',
        name: ''
      } as any
    } as any,
    onSubmit: jest.fn(),
    onChange: jest.fn()
  },
  children: [
    {
      props: {
        name: '',
        type: 'APPROVAL',
        icon: 'nav-harness',
        isApproval: true,
        isDisabled: false,
        title: 'ApprovalStage',
        description: ''
      },
      type: '',
      key: 'approval'
    }
  ]
})

export const getPropsForMinimalStageWithTemplateUsed = (): ApprovalStageMinimalModeProps => ({
  data: {
    stage: {
      identifier: '',
      name: ''
    } as any
  } as any,
  template: approvalStageTemplateSummaryMock,
  onSubmit: jest.fn(),
  onChange: jest.fn()
})

export const getPropsForMinimalStageWithTemplateCopied = (): ApprovalStageMinimalModeProps => ({
  data: {
    stage: {
      identifier: '',
      name: '',
      ...approvalStageTemplateMock.spec
    } as any
  } as any,
  onSubmit: jest.fn(),
  onChange: jest.fn()
})

export const approvalStageTemplateMock = {
  name: 'Approval Stage Test',
  identifier: 'Approval_Stage_Test',
  versionLabel: 'v1',
  type: 'Stage',
  projectIdentifier: 'Yogesh_Test',
  orgIdentifier: 'default',
  tags: {},
  spec: {
    type: 'Approval',
    spec: {
      execution: {
        steps: [
          {
            step: {
              name: 'Approval',
              identifier: 'approval',
              type: 'HarnessApproval',
              timeout: '1d',
              spec: {
                approvalMessage: 'Please review the following information\nand approve the pipeline progression',
                includePipelineExecutionHistory: true,
                approvers: { minimumCount: 1, disallowPipelineExecutor: false }
              }
            }
          }
        ]
      }
    }
  }
}

export const approvalStageTemplateSummaryMock: TemplateSummaryResponse = {
  accountId: 'px7xd_BFRCi-pfWPYXVjvw',
  orgIdentifier: 'default',
  projectIdentifier: 'Yogesh_Test',
  identifier: 'Approval_Stage_Test',
  name: 'Approval Stage Test',
  description: '',
  tags: {},
  yaml: yamlStringify({ template: approvalStageTemplateMock }),
  versionLabel: 'v1',
  templateEntityType: 'Stage',
  childType: 'Approval',
  templateScope: 'project',
  version: 0,
  gitDetails: {},
  entityValidityDetails: {
    valid: true
  },
  lastUpdatedAt: 1645627607011,
  stableTemplate: true
}

class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
  protected stepName = 'stepOne'
  protected stepIcon: IconName = 'cross'
}

class StepOne extends Step<Record<string, any>> {
  protected type = StepType.HarnessApproval
  protected stepName = 'stepOne'
  protected referenceId = 'stepOne'
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
  protected referenceId = 'stepTwo'
  protected stepIcon: IconName = 'cross'
  validateInputSet(): Record<string, any> {
    return {}
  }
  protected defaultValues = { a: 'a' }
  renderStep(props: StepProps<Record<string, any>>): JSX.Element {
    return <div onClick={() => props.onUpdate?.(props.initialValues)}>{JSON.stringify(props.initialValues)}</div>
  }
}

const stepFactory = new StepFactory()
stepFactory.registerStep(new StepOne())
stepFactory.registerStep(new StepTwo())

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
            name: 'ApprovalStep',
            identifier: 'ApprovalStep',
            description: '',
            type: 'Approval',
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
            name: 'ApprovalStep',
            identifier: 'ApprovalStep',
            description: '',
            type: 'Approval',
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
    selectionState: { selectedStageId: 'ApprovalStep', selectedStepId: 'harnessApproval' },
    isLoading: false,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isUpdated: true,
    isInitialized: true,
    error: '',
    templateTypes: {}
  },
  contextType: 'Pipeline',
  stepsFactory: stepFactory,
  stagesMap
}

export const pipelineContextMockJiraApproval = {
  state: {
    pipeline: {
      name: 'Pipeline',
      identifier: 'Pipeline',
      description: null,
      tags: null,
      stages: [
        {
          stage: {
            name: 'ApprovalStep',
            identifier: 'ApprovalStep',
            description: '',
            type: 'Approval',
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
            name: 'ApprovalStep',
            identifier: 'ApprovalStep',
            description: '',
            type: 'Approval',
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
    selectionState: { selectedStageId: 'ApprovalStep', selectedStepId: 'jiraApproval' },
    isLoading: false,
    isBEPipelineUpdated: false,
    isDBInitialized: true,
    isUpdated: true,
    isInitialized: true,
    error: ''
  },
  contextType: 'Pipeline',
  stepsFactory: stepFactory,
  stagesMap
}

export const mockYamlSnippetResponse = {
  loading: false,
  error: null,
  data: {
    status: 'SUCCESS',
    data: 'spec:\n  execution:\n    steps:\n      - step:\n          name: "Approval"\n          identifier: approval\n          type: HarnessApproval\n          timeout: 1d\n          spec:\n            approvalMessage: |-\n              Please review the following information\n              and approve the pipeline progression\n            includePipelineExecutionHistory: true\n            approvers:\n              minimumCount: 1\n              disallowPipelineExecutor: false\n',
    metaData: null as unknown as undefined,
    correlationId: 'someId'
  }
}

export const mockYamlSnippetResponseJira = {
  loading: false,
  error: null,
  data: {
    status: 'SUCCESS',
    data: 'spec:\n  execution:\n    steps:\n      - step:\n          name: "Jira Create"\n          identifier: jiraCreate\n          type: JiraCreate\n          timeout: 5m\n          spec:\n            fields: []\n      - step:\n          name: "Jira Approval"\n          identifier: jiraApproval\n          type: JiraApproval\n          timeout: 1d\n          spec:\n            approvalCriteria:\n              type: KeyValues\n              spec:\n                matchAnyCondition: false\n                conditions: []\n            rejectionCriteria:\n              type: KeyValues\n              spec:\n                matchAnyCondition: false\n                conditions: []\n      - step:\n          name: "Jira Update"\n          identifier: jiraUpdate\n          type: JiraUpdate\n          timeout: 5m\n          spec:\n            fields: []\n',
    metaData: null as unknown as undefined,
    correlationId: 'someId'
  }
}

export const getDummyPipelineContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    updatePipeline: jest.fn(),
    updatePipelineView: jest.fn(),
    updateStage: jest.fn().mockResolvedValue({}),
    setSelectedSectionId: jest.fn(),
    setSelectedTabId: jest.fn(),
    getStagePathFromPipeline: jest.fn(),
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
    }),
    setTemplateTypes: jest.fn()
  } as any
}

export const getDummyPipelineContextValueJiraApproval = (): PipelineContextInterface => {
  return {
    ...pipelineContextMockJiraApproval,
    updatePipeline: jest.fn(),
    updatePipelineView: jest.fn(),
    updateStage: jest.fn().mockResolvedValue({}),
    setSelectedSectionId: jest.fn(),
    setSelectedTabId: jest.fn(),
    getStagePathFromPipeline: jest.fn(),
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMockJiraApproval.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}
