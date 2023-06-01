/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, queryByAttribute, waitFor, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'

import { findPopoverContainer } from '@common/utils/testUtils'
import { TestStepWidget, factory } from '../../__tests__/StepTestUtil'
import { HarnessApproval } from '../HarnessApproval'
import {
  getHarnessApprovalDeploymentModeProps,
  getHarnessApprovalInputVariableModeProps,
  mockUserGroupsResponse,
  getHarnessApprovalEditModeProps,
  getHarnessApprovalEditModePropsWithValues,
  getHarnessApprovalEditModePropsAsExpressions,
  getHarnessApprovalEditModePropsMinimumCountNegative,
  getYaml,
  getParams,
  userGroupsAggregate,
  batchUserGroupListMock
} from './HarnessApprovalTestHelper'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  useGetUserGroupList: () => mockUserGroupsResponse,
  getUserGroupListPromise: jest.fn(() => Promise.resolve(mockUserGroupsResponse.data)),
  getUserGroupAggregateListPromise: jest.fn().mockImplementation(() => {
    return new Promise(resolve => {
      resolve({ data: userGroupsAggregate.data, refetch: jest.fn(), error: null, loading: false })
    })
  }),
  getBatchUserGroupListPromise: jest.fn().mockImplementation(() => {
    return new Promise(resolve => {
      resolve({ data: batchUserGroupListMock.data, refetch: jest.fn(), error: null, loading: false })
    })
  })
}))

const scheduleAutoApproveActions = async (
  container: HTMLElement,
  getByText: RenderResult['getByText']
): Promise<void> => {
  act(() => {
    userEvent.click(getByText('pipeline.approvalStep.scheduleAutoApprovalOptional'))
  })

  const autoApproveCheckBox = container.querySelector('input[name="AutoApprove"]')
  const timeField = container.querySelector('input[name="spec.autoApproval.scheduledDeadline.time"]')
  const messageTextArea = container.querySelector('textarea[name="spec.autoApproval.comments"]')

  // check default behaviour
  expect(autoApproveCheckBox).not.toBeChecked()
  expect(timeField).toBeDisabled()
  expect(messageTextArea).toBeDisabled()

  // add auto approval
  userEvent.click(autoApproveCheckBox as HTMLInputElement)
  expect(autoApproveCheckBox).toBeChecked()
  expect(timeField).not.toBeDisabled()
  expect(messageTextArea).not.toBeDisabled()

  await act(async () => {
    fireEvent.change(messageTextArea as HTMLTextAreaElement, {
      target: { value: 'Auto approved by Harness via Harness Apporval step' }
    })
  })
}

describe('Harness Approval tests', () => {
  beforeAll(() => {
    jest.spyOn(global.Date, 'now').mockReturnValue(1603645966706)
  })
  afterAll(() => {
    jest.spyOn(global.Date, 'now').mockReset()
  })
  beforeEach(() => {
    factory.registerStep(new HarnessApproval())
    jest.spyOn(FeatureFlag, 'useFeatureFlag').mockReturnValue(true)
  })

  test('Basic snapshot - inputset mode', async () => {
    const props = getHarnessApprovalDeploymentModeProps()
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        template={props.inputSetData.template}
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )

    fireEvent.click(getByText('Submit'))
    await waitFor(() => queryByText('Errors'))
    expect(container).toMatchSnapshot('input set with errors')
  })

  test('Basic snapshot - deploymentform mode', async () => {
    const props = getHarnessApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData.template}
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={props.inputSetData}
      />
    )

    expect(container).toMatchSnapshot('harness-approval-deploymentform')
  })

  test('Basic snapshot - deploymentform mode readonly', async () => {
    const props = getHarnessApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        template={props.inputSetData.template}
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.DeploymentForm}
        inputSetData={{ ...props.inputSetData, path: props.inputSetData?.path || '', readonly: true }}
      />
    )

    expect(container).toMatchSnapshot('harness-approval-deploymentform-readonly')
  })

  test('Basic snapshot - inputset mode but no runtime values', async () => {
    const props = getHarnessApprovalDeploymentModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        template={{ spec: { approvers: {} } }}
        stepViewType={StepViewType.InputSet}
        inputSetData={props.inputSetData}
      />
    )
    expect(container).toMatchSnapshot('harness-approval-inputset-noruntime')
  })

  test('Basic snapshot - input variable view', () => {
    const props = getHarnessApprovalInputVariableModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        template={{ spec: { approvers: {} } }}
        stepViewType={StepViewType.InputVariable}
        customStepProps={props.customStepProps}
      />
    )

    expect(container).toMatchSnapshot('harness-approval-input variable view')
  })

  test('Basic functions - edit stage view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getHarnessApprovalEditModeProps()
    const { container, queryByText, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
      />
    )

    // Submit with empty form
    await act(() => ref.current?.submitForm()!)
    expect(getByText('pipelineSteps.stepNameRequired')).toBeTruthy()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'harness approval step' } })
    fireEvent.change(queryByNameAttribute('spec.approvalMessage')!, { target: { value: 'approval message' } })
    fireEvent.click(queryByNameAttribute('spec.includePipelineExecutionHistory')!)

    act(() => {
      fireEvent.click(getByText('pipelineSteps.timeoutLabel'))
    })
    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '' } })

    await act(() => ref.current?.submitForm()!)
    expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()

    await act(() => ref.current?.submitForm()!)

    await waitFor(() => expect(queryByText('pipeline.approvalStep.validation.userGroups')).toBeTruthy())
  })

  test('Edit stage - readonly', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getHarnessApprovalEditModeProps()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        readonly={true}
      />
    )

    expect(container).toMatchSnapshot('edit stage readonly')
  })

  test('Edit stage - submit field values as expressions', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getHarnessApprovalEditModePropsAsExpressions()
    const { container } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
      />
    )

    expect(container).toMatchSnapshot('edit stage readonly with expressions')

    await act(() => ref.current?.submitForm()!)
    expect(props.onUpdate).toBeCalledWith({
      identifier: 'hhaass',
      timeout: '10s',
      type: 'HarnessApproval',
      spec: {
        approvalMessage: '<+somemessage>',
        includePipelineExecutionHistory: '',
        isAutoRejectEnabled: false,
        approverInputs: '',
        approvers: {
          userGroups: '<+abc>',
          minimumCount: '<+minCount>',
          disallowPipelineExecutor: ''
        }
      },
      name: 'harness approval step'
    })
  })

  test('MinimumCount should be greater than 1', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getHarnessApprovalEditModePropsMinimumCountNegative()
    const { container, queryByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
      />
    )

    expect(container).toMatchSnapshot('minimum count as negative')

    await act(() => ref.current?.submitForm()!)
    await waitFor(() => expect(queryByText('pipeline.approvalStep.validation.minimumCountOne')).toBeTruthy())
  })

  test('Add Approver Inputs should work as expected', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getHarnessApprovalEditModePropsWithValues()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
        onChange={props.onChange}
      />
    )

    act(() => {
      fireEvent.click(getByText('pipeline.approvalStep.approverInputsOptional'))
    })
    expect(container.querySelector(`input[name="spec.approverInputs[0].name"]`)).toHaveValue('somekey')
    expect(container.querySelector(`input[name="spec.approverInputs[0].defaultValue"]`)).toHaveValue('somevalue')

    act(() => {
      fireEvent.click(getByText('pipeline.approvalStep.addApproverInputs'))
    })
    expect(props.onChange).not.toBeCalled()

    const secondApproverInputNameField = container.querySelector(
      `input[name="spec.approverInputs[1].name"]`
    ) as HTMLElement
    const secondApproverInputValueField = container.querySelector(
      `input[name="spec.approverInputs[1].defaultValue"]`
    ) as HTMLElement

    expect(secondApproverInputNameField).toHaveValue('')
    expect(secondApproverInputValueField).toHaveValue('')

    await act(async () => {
      await fireEvent.change(secondApproverInputNameField, { target: { value: 'someotherkey' } })
      fireEvent.change(secondApproverInputValueField, { target: { value: 'someothervalue' } })
    })
    expect(props.onChange).toBeCalledWith({
      identifier: 'hhaass',
      name: 'harness approval step',
      spec: {
        approvalMessage: 'Approving pipeline <+pname>',
        approverInputs: [
          { defaultValue: 'somevalue', name: 'somekey' },
          { defaultValue: 'someothervalue', name: 'someotherkey' }
        ],
        approvers: {
          disallowPipelineExecutor: true,
          minimumCount: 1,
          userGroups: ['ug1', 'org.ug2', 'org.ug3', 'ug4', 'account.ug5', 'account.ug6']
        },
        autoApproval: {
          action: 'REJECT',
          comments: 'Auto approved by Harness via Harness Approval step',
          scheduledDeadline: { time: '2020-10-25 05:12 PM', timeZone: 'UTC' }
        },
        includePipelineExecutionHistory: true,
        isAutoRejectEnabled: false
      },
      timeout: '10m',
      type: 'HarnessApproval'
    })
  })

  test('On submit call', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getHarnessApprovalEditModePropsWithValues()
    const { container, queryByDisplayValue, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
      />
    )

    expect(container).toMatchSnapshot('values populating on edit')

    // Open third accordion
    act(() => {
      fireEvent.click(getByText('pipeline.approvalStep.approverInputsOptional'))
    })
    expect(queryByDisplayValue('somekey')).toBeTruthy()
    expect(queryByDisplayValue('somevalue')).toBeTruthy()

    act(() => {
      fireEvent.click(getByText('pipeline.approvalStep.addApproverInputs'))
    })

    await act(() => ref.current?.submitForm()!)
    expect(props.onUpdate).toBeCalledWith({
      identifier: 'hhaass',
      timeout: '10m',
      type: 'HarnessApproval',
      spec: {
        approvalMessage: 'Approving pipeline <+pname>',
        includePipelineExecutionHistory: true,
        isAutoRejectEnabled: false,
        approverInputs: [{ name: 'somekey', defaultValue: 'somevalue' }],
        approvers: {
          userGroups: ['ug1', 'org.ug2', 'org.ug3', 'ug4', 'account.ug5', 'account.ug6'],
          minimumCount: 1,
          disallowPipelineExecutor: true
        }
      },
      name: 'harness approval step'
    })
  })

  const userGroupsRefPath = 'pipeline.stages.0.stage.spec.execution.steps.0.step.spec.approvers.userGroups'
  test('Test UserGroup autocomplete', async () => {
    const step = new HarnessApproval() as any
    let list: CompletionItemInterface[]
    list = await step.getUgListForYaml(userGroupsRefPath, getYaml(), getParams())
    expect(list).toHaveLength(3)
    expect(list[0].insertText).toBe('ug1')
    list = await step.getUgListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)
  })

  test('Minimum time cannot be less than 10s', () => {
    const response = new HarnessApproval().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '1s',
        type: 'HarnessApproval',
        spec: {
          approvalMessage: 'Please review the following information and approve the pipeline progression',
          includePipelineExecutionHistory: true,
          isAutoRejectEnabled: false,
          approvers: {
            userGroups: [],
            minimumCount: 1,
            disallowPipelineExecutor: false
          },
          approverInputs: [
            {
              name: '',
              defaultValue: ''
            }
          ]
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '<+input>',
        type: 'HarnessApproval',
        spec: {
          approvalMessage: 'Please review the following information and approve the pipeline progression',
          includePipelineExecutionHistory: true,
          isAutoRejectEnabled: false,
          approvers: {
            userGroups: [],
            minimumCount: 1,
            disallowPipelineExecutor: false
          },
          approverInputs: [
            {
              name: '',
              defaultValue: ''
            }
          ]
        }
      },
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot('Value must be greater than or equal to "10s"')
  })

  test('Show warning message in modal when user group is deleted and update the user group list', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getHarnessApprovalEditModePropsWithValues()
    const { findByText, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
        onChange={props.onChange}
      />
    )

    const btn = await findByText(/project/i)
    expect(btn).toBeTruthy()
    userEvent.click(btn)

    await waitFor(() => expect(document.querySelector('.bp3-dialog div[data-tab-id="account"]')).toBeInTheDocument())
    fireEvent.click(document.querySelector('.bp3-dialog div[data-tab-id="account"]') as HTMLElement)
    expect(getByText('6')).toBeInTheDocument()
    expect(getByText('common.userGroupsWarningMessage')).toBeInTheDocument()
    fireEvent.click(getByText('update'))
    expect(getByText('5')).toBeInTheDocument()
  })

  test('Schedule auto approval should work as expected', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getHarnessApprovalEditModePropsWithValues()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
        onChange={props.onChange}
      />
    )

    await scheduleAutoApproveActions(container, getByText)

    //make timeout as runtime and check warning msg
    userEvent.click(container.querySelector('[data-id="timeout-1"] [data-icon="fixed-input"]') as HTMLElement)
    const timeoutField = findPopoverContainer()
    expect(timeoutField).toBeTruthy()
    userEvent.click(getByText('Runtime input'))

    //check warning msg
    expect(getByText('pipeline.approvalStep.validation.autoApproveScheduleTimeout'))

    expect(props.onChange).toBeCalledWith({
      identifier: 'hhaass',
      name: 'harness approval step',
      spec: {
        approvalMessage: 'Approving pipeline <+pname>',
        approverInputs: [{ defaultValue: 'somevalue', name: 'somekey' }],
        approvers: {
          disallowPipelineExecutor: true,
          minimumCount: 1,
          userGroups: ['ug1', 'org.ug2', 'org.ug3', 'ug4', 'account.ug5', 'account.ug6']
        },
        autoApproval: {
          action: 'APPROVE',
          comments: 'Auto approved by Harness via Harness Approval step',
          scheduledDeadline: { time: '2020-10-25 05:12 PM', timeZone: 'UTC' }
        },
        includePipelineExecutionHistory: true,
        isAutoRejectEnabled: false
      },
      timeout: '<+input>',
      type: 'HarnessApproval'
    })
  })

  test('Test submitting schedule approval - by unchecking autoApproveCheckbox', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const props = getHarnessApprovalEditModePropsWithValues()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={props.initialValues}
        type={StepType.HarnessApproval}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={props.onUpdate}
      />
    )

    scheduleAutoApproveActions(container, getByText)

    //uncheck autoApprove
    userEvent.click(container.querySelector('input[name="AutoApprove"]') as HTMLInputElement)

    await act(() => ref.current?.submitForm()!)

    //should not contain autoApprove fields
    expect(props.onUpdate).toBeCalledWith({
      identifier: 'hhaass',
      name: 'harness approval step',
      spec: {
        approvalMessage: 'Approving pipeline <+pname>',
        approverInputs: [{ defaultValue: 'somevalue', name: 'somekey' }],
        approvers: {
          disallowPipelineExecutor: true,
          minimumCount: 1,
          userGroups: ['ug1', 'org.ug2', 'org.ug3', 'ug4', 'account.ug5', 'account.ug6']
        },
        includePipelineExecutionHistory: true,
        isAutoRejectEnabled: false
      },
      timeout: '10m',
      type: 'HarnessApproval'
    })
  })
})
