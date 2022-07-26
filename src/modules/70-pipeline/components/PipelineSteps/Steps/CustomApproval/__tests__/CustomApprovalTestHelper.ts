/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { MultiTypeInputType } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getDefaultCriterias } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import type { CustomApprovalInputSetStepProps } from '@pipeline/components/PipelineSteps/Steps/CustomApproval/CustomApprovalInputSetStep'

export const getCustomApprovalEditModeProps = (): CustomApprovalInputSetStepProps => ({
  initialValues: {
    timeout: '5s',
    name: '',
    type: StepType.CustomApproval,
    identifier: '',
    spec: {
      scriptTimeout: '2m',
      retryInterval: '20s',
      approvalCriteria: getDefaultCriterias(),
      rejectionCriteria: getDefaultCriterias(),
      outputVariables: [
        {
          name: 'testOutput1',
          type: 'String',
          value: 'someVal1',
          id: 'id1'
        },
        {
          name: 'testOutput2',
          type: 'String',
          value: 'someVal2',
          id: 'id2'
        }
      ]
    }
  },
  onUpdate: jest.fn(),
  stepViewType: StepViewType.Edit,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getCustomApprovalDeploymentModeProps = (): CustomApprovalInputSetStepProps => ({
  stepViewType: StepViewType.InputSet,
  initialValues: {
    name: '',
    type: StepType.CustomApproval,
    identifier: '',
    spec: {
      approvalCriteria: getDefaultCriterias(),
      rejectionCriteria: getDefaultCriterias(),
      onDelegate: true,
      shell: 'Bash',
      scriptTimeout: '2m',
      retryInterval: '20s',
      outputVariables: [
        {
          name: 'testOutput1',
          type: 'String',
          value: 'someVal1',
          id: 'id1'
        },
        {
          name: 'testOutput2',
          type: 'String',
          value: 'someVal2',
          id: 'id2'
        }
      ]
    }
  },
  onUpdate: jest.fn(),
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
})

export const getCustomApprovalInputVariableModeProps = () => ({
  initialValues: {
    spec: {}
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
      }
    },
    variablesData: {
      type: StepType.CustomApproval,
      identifier: 'custom_approval',
      name: 'step-name',
      description: 'Description',
      timeout: 'step-timeout',
      spec: {
        scriptTimeout: '2m',
        retryInterval: '20s',
        source: {
          spec: {
            script: 'hello'
          }
        },
        outputVariables: [
          {
            name: 'testOutput1',
            type: 'String',
            value: 'someVal1'
          }
        ],
        environmentVariables: [
          {
            name: 'testInput1',
            type: 'String',
            value: 'someVal3'
          }
        ]
      }
    }
  },
  onUpdate: jest.fn()
})
