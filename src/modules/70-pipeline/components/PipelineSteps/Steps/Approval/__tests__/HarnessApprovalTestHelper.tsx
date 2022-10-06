/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypesWithRunTime, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { UseGetMockData } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ResponsePageUserGroupDTO } from 'services/cd-ng'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { HarnessApprovalStepModeProps } from '../types'

export const getHarnessApprovalEditModeProps = () => ({
  initialValues: {
    timeout: '5s',
    spec: {
      approvalMessage: '',
      includePipelineExecutionHistory: '',
      approverInputs: '',
      approvers: {
        userGroups: [],
        minimumCount: '',
        disallowPipelineExecutor: ''
      }
    }
  },
  onUpdate: jest.fn()
})

export const getHarnessApprovalEditModePropsAsExpressions = (): HarnessApprovalStepModeProps => ({
  initialValues: {
    timeout: '10s',
    type: 'HarnessApproval',
    name: 'harness approval step',
    identifier: 'hhaass',
    spec: {
      approvalMessage: '<+somemessage>',
      includePipelineExecutionHistory: '',
      approverInputs: '',
      approvers: {
        userGroups: '<+abc>',
        minimumCount: '<+minCount>',
        disallowPipelineExecutor: ''
      }
    }
  },
  onUpdate: jest.fn(),
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  stepViewType: StepViewType.Edit
})

export const getHarnessApprovalEditModePropsMinimumCountNegative = (): HarnessApprovalStepModeProps => ({
  initialValues: {
    timeout: '10s',
    type: 'HarnessApproval',
    name: 'harness approval step',
    identifier: 'hhaass',
    spec: {
      approvalMessage: '<+somemessage>',
      includePipelineExecutionHistory: '',
      approverInputs: '',
      approvers: {
        userGroups: '<+abc>',
        minimumCount: -2,
        disallowPipelineExecutor: ''
      }
    }
  },
  onUpdate: jest.fn(),
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  stepViewType: StepViewType.Edit
})

export const getHarnessApprovalEditModePropsWithValues = (): HarnessApprovalStepModeProps => ({
  initialValues: {
    timeout: '10m',
    type: 'HarnessApproval',
    name: 'harness approval step',
    identifier: 'hhaass',
    spec: {
      approvalMessage: 'Approving pipeline <+pname>',
      includePipelineExecutionHistory: true,
      approverInputs: [
        {
          name: 'somekey',
          defaultValue: 'somevalue'
        }
      ],
      approvers: {
        userGroups: ['ug1', 'org.ug2', 'org.ug3', 'ug4', 'account.ug5', 'account.ug6'],
        minimumCount: 1,
        disallowPipelineExecutor: true
      }
    }
  },
  onUpdate: jest.fn(),
  onChange: jest.fn(),
  allowableTypes: [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.RUNTIME,
    MultiTypeInputType.EXPRESSION
  ] as AllowedTypesWithRunTime[],
  stepViewType: StepViewType.Edit
})

export const getHarnessApprovalDeploymentModeProps = () => ({
  initialValues: {
    spec: {
      approvalMessage: '',
      includePipelineExecutionHistory: false,
      approverInputs: [],
      approvers: {
        userGroups: [],
        minimumCount: 0,
        disallowPipelineExecutor: false
      }
    }
  },
  inputSetData: {
    path: '/ab/',
    template: {
      spec: {
        approvalMessage: RUNTIME_INPUT_VALUE,
        includePipelineExecutionHistory: RUNTIME_INPUT_VALUE,
        approverInputs: RUNTIME_INPUT_VALUE,
        approvers: {
          userGroups: RUNTIME_INPUT_VALUE,
          minimumCount: RUNTIME_INPUT_VALUE,
          disallowPipelineExecutor: RUNTIME_INPUT_VALUE
        }
      }
    }
  },
  onUpdate: jest.fn()
})

export const getHarnessApprovalInputVariableModeProps = () => ({
  initialValues: {
    spec: {}
  },
  customStepProps: {
    stageIdentifier: 'qaStage',
    metadataMap: {
      'step-identifier': {
        yamlExtraProperties: {
          properties: [
            {
              fqn: 'pipeline.stages.qaStage.execution.steps.approval.identifier',
              localName: 'step.approval.identifier',
              variableName: 'identifier'
            }
          ]
        }
      },
      'step-name': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.name',
          localName: 'step.approval.name'
        }
      },
      'step-timeout': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.timeout',
          localName: 'step.approval.timeout'
        }
      },
      'step-approvalMessage': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.approvalMessage',
          localName: 'step.approval.spec.approvalMessage'
        }
      },
      'step-includePipelineExecutionHistory': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.includePipelineExecutionHistory',
          localName: 'step.approval.spec.includePipelineExecutionHistory'
        }
      },
      'step-approverusers': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.approvers.users',
          localName: 'step.approval.spec.approvers.users'
        }
      },
      'step-approvergroups': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.approvers.userGroups',
          localName: 'step.approval.spec.approvers.userGroups'
        }
      },
      'step-minimumCount': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.approvers.minimumCount',
          localName: 'step.approval.spec.approvers.minimumCount'
        }
      },
      'step-disallowPipelineExecutor': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.disallowPipelineExecutor',
          localName: 'step.approval.spec.disallowPipelineExecutor'
        }
      },
      'step-approverInputs': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.approval.spec.approverInputs',
          localName: 'step.approval.spec.approverInputs'
        }
      }
    },
    variablesData: {
      type: StepType.HarnessApproval,
      __uuid: 'step-identifier',
      identifier: 'harness_approval',
      name: 'step-name',
      description: 'Description',
      timeout: 'step-timeout',
      spec: {
        approvalMessage: 'step-approvalMessage',
        includePipelineExecutionHistory: 'step-includePipelineExecutionHistory',
        approvers: {
          userGroups: 'step-approvergroups',
          minimumCount: 'step-minimumCount'
        },
        disallowPipelineExecutor: 'step-disallowPipelineExecutor',
        approverInputs: 'step-approverInputs'
      }
    }
  },
  onUpdate: jest.fn(),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
})

export const mockUsersResponse = {
  loading: false,
  error: null,
  data: {
    status: 'SUCCESS',
    content: [{ name: 'ug11', uuid: 'uv1' }],
    metaData: null as unknown as undefined,
    correlationId: 'someId'
  }
}

export const mockUserGroupsResponse: UseGetMockData<ResponsePageUserGroupDTO> = {
  loading: false,
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      content: [
        { name: 'ug1', identifier: 'ug1' },
        { name: 'ug2', identifier: 'ug2' },
        { name: 'ug3', identifier: 'ug3' }
      ]
    }
  }
}

export const getYaml = () => `pipeline:
    stages:
      - stage:
            spec:
                execution:
                    steps:
                        - step:
                              name: Harness Approval
                              identifier: harnessApproval
                              type: HarnessApproval
                              timeout: 1d
                              spec:
                                  approvers:
                                      userGroups: account.userGroup1`

export const getParams = () => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})
