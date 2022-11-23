/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { Card, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StepWidgetProps } from '@pipeline/components/AbstractSteps/StepWidget'

import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { HarnessApproval } from './HarnessApproval'

factory.registerStep(new HarnessApproval())

export default {
  title: 'Pipelines / Pipeline Steps / Harness Approval Step',
  component: TestStepWidget,
  argTypes: {
    type: { control: { disable: true } },
    stepViewType: {
      control: {
        type: 'inline-radio',
        options: Object.keys(StepViewType)
      }
    },
    onUpdate: { control: { disable: true } },
    initialValues: {
      control: {
        type: 'object'
      }
    }
  }
} as Meta

export const HarnessApprovalSB: Story<Omit<StepWidgetProps, 'factory'>> = args => {
  const [value, setValue] = React.useState({})
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', columnGap: '20px' }}>
      <Card>
        <TestStepWidget {...args} onUpdate={setValue} />
      </Card>
      <Card>
        <pre>{yamlStringify(value)}</pre>
      </Card>
    </div>
  )
}

HarnessApprovalSB.args = {
  initialValues: {
    identifier: 'Test_A',
    name: 'approvalstep',
    type: StepType.HarnessApproval,
    description: 'Approval step description',
    timeout: '30m',
    spec: {
      approvalMessage: 'Some approval message',
      includePipelineExecutionHistory: true,
      approvers: {
        users: [],
        userGroups: ['ug1', 'ug2'],
        minimumCount: 2
      },
      disallowPipelineExecutor: true,
      approverInputs: { n1: 'v1' }
    }
  },
  type: StepType.HarnessApproval,
  stepViewType: StepViewType.Edit,
  path: '',
  template: {
    identifier: 'Test_A',
    type: StepType.HarnessApproval,
    spec: {
      approvalMessage: RUNTIME_INPUT_VALUE,
      includePipelineExecutionHistory: RUNTIME_INPUT_VALUE,
      approvers: {
        userGroups: RUNTIME_INPUT_VALUE,
        users: RUNTIME_INPUT_VALUE,
        minimumCount: RUNTIME_INPUT_VALUE,
        disallowPipelineExecutor: RUNTIME_INPUT_VALUE
      },
      approverInputs: RUNTIME_INPUT_VALUE
    },
    timeout: RUNTIME_INPUT_VALUE
  },
  allValues: {
    type: StepType.HarnessApproval,
    name: 'Manual Approval',
    identifier: 'Manual_approval_id1',
    spec: {
      approvalMessage: '',
      includePipelineExecutionHistory: false,
      approvers: {
        userGroups: [],
        users: [],
        minimumCount: 1,
        disallowPipelineExecutor: true
      },
      approverInputs: []
    }
  },
  customStepProps: {
    stageIdentifier: 'qaStage',
    metadataMap: {
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
      identifier: 'harness_approval',
      name: 'step-name',
      description: 'Description',
      timeout: 'step-timeout',
      spec: {
        approvalMessage: 'step-approvalMessage',
        includePipelineExecutionHistory: 'step-includePipelineExecutionHistory',
        approvers: {
          users: 'step-approverusers',
          userGroups: 'step-approvergroups',
          minimumCount: 'step-minimumCount'
        },
        disallowPipelineExecutor: 'step-disallowPipelineExecutor',
        approverInputs: 'step-approverInputs'
      }
    }
  },
  readonly: false
}
