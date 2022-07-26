/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getDefaultCriterias } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { CustomApproval } from '../CustomApproval'
import {
  getCustomApprovalDeploymentModeProps,
  getCustomApprovalEditModeProps,
  getCustomApprovalInputVariableModeProps
} from './CustomApprovalTestHelper'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('CustomApproval tests', () => {
  beforeEach(() => {
    factory.registerStep(new CustomApproval())
  })

  test('Basic snapshot - inputset mode', async () => {
    const props = getCustomApprovalDeploymentModeProps()
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.CustomApproval}
        stepViewType={StepViewType.InputSet}
      />
    )

    fireEvent.click(getByText('Submit'))
    await waitFor(() => queryByText('Errors'))
    expect(container).toMatchSnapshot('input set with errors')
  })

  test('Basic snapshot - deploymentform mode', async () => {
    const props = getCustomApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.CustomApproval}
        stepViewType={StepViewType.DeploymentForm}
      />
    )

    expect(container).toMatchSnapshot('custom-approval-deploymentform')
  })

  test('deploymentform mode - readonly', async () => {
    const props = getCustomApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.CustomApproval}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={{ path: '', readonly: true }}
      />
    )

    expect(container).toMatchSnapshot('custom-approval-deploymentform readonly')
  })

  test('Basic snapshot - inputset mode but no runtime values', async () => {
    const props = getCustomApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.CustomApproval}
        template={{
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
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
            ],
            approvalCriteria: getDefaultCriterias(),
            scriptTimeout: RUNTIME_INPUT_VALUE,
            retryInterval: RUNTIME_INPUT_VALUE,
            rejectionCriteria: getDefaultCriterias(),
            source: {
              spec: {
                script: RUNTIME_INPUT_VALUE
              }
            }
          }
        }}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot('custom-approval-inputset-noruntime')
  })

  test('Basic snapshot - input variable view', () => {
    const props = getCustomApprovalInputVariableModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.CustomApproval}
        template={{ spec: { approvalCriteria: getDefaultCriterias(), rejectionCriteria: getDefaultCriterias() } }}
        stepViewType={StepViewType.InputVariable}
        customStepProps={props.customStepProps}
      />
    )

    expect(container).toMatchSnapshot('custom-approval-input variable view')
  })

  test('Edit stage - readonly', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getCustomApprovalEditModeProps()

    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.CustomApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        readonly={true}
      />
    )

    expect(container).toMatchSnapshot('edit stage view readonly')
  })

  test('Edit stage - readonly with runtime values', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const editModeProps = getCustomApprovalEditModeProps()

    const props = {
      ...editModeProps,
      initialValues: {
        ...editModeProps.initialValues,
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          ...editModeProps.initialValues.spec,
          scriptTimeout: RUNTIME_INPUT_VALUE,
          retryInterval: RUNTIME_INPUT_VALUE,
          source: {
            spec: {
              script: '<+expression>'
            }
          },
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
      }
    }

    const { container, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.CustomApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        readonly={true}
      />
    )

    fireEvent.click(getByText('common.optionalConfig'))

    expect(container).toMatchSnapshot('edit stage view readonly with runtime values')
  })

  test('Minimum time cannot be less than 10s', () => {
    const response = new CustomApproval().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '1s',
        type: 'CustomApproval',
        spec: {
          approvalCriteria: getDefaultCriterias(),
          rejectionCriteria: getDefaultCriterias(),
          outputVariables: [
            {
              name: 'testOutput1',
              type: 'String',
              value: 'someVal1'
            },
            {
              name: 'testOutput2',
              type: 'String',
              value: 'someVal2'
            }
          ]
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '<+input>',
        type: 'CustomApproval',
        spec: {
          approvalCriteria: getDefaultCriterias(),
          rejectionCriteria: getDefaultCriterias(),
          outputVariables: [
            {
              name: 'testOutput1',
              type: 'String',
              value: '<+input>'
            },
            {
              name: 'testOutput2',
              type: 'String',
              value: '<+input>'
            }
          ],
          source: {
            spec: {
              script: '<+input>'
            }
          },
          retryInterval: '<+input>'
        }
      },
      viewType: StepViewType.TriggerForm,
      getString: jest.fn()
    })
    expect(response).toMatchSnapshot('Value must be greater than or equal to "10s"')
  })
})
