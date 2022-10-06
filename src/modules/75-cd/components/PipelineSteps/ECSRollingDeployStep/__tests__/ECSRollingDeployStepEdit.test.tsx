/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
  fireEvent,
  queryByAttribute,
  render,
  waitFor,
  getByText as getElementByText
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import type { StepElementConfig } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { ECSRollingDeployStepEditRef } from '../ECSRollingDeployStepEdit'

const doConfigureOptionsTesting = async (cogModal: HTMLElement) => {
  // Type regex and submit
  // check if field has desired value
  await waitFor(() => expect(getElementByText(cogModal, 'common.configureOptions.regex')).toBeInTheDocument())
  const regexRadio = getElementByText(cogModal, 'common.configureOptions.regex')
  userEvent.click(regexRadio)
  const regexTextArea = queryByAttribute('name', cogModal, 'regExValues') as HTMLInputElement
  act((): void => {
    fireEvent.change(regexTextArea!, { target: { value: '<+input>.includes(/test/)' } })
  })
  await waitFor(() => expect(regexTextArea.value).toBe('<+input>.includes(/test/)'))
  const cogSubmit = getElementByText(cogModal, 'submit')
  userEvent.click(cogSubmit)
}

// type is not used in the component anywhere, just need to pass it as prop for typecheck to pass
const emptyInitialValues: StepElementConfig = { identifier: '', name: '', timeout: '', type: StepType.EcsRollingDeploy }
const existingInitialValues: StepElementConfig = {
  identifier: 'Existing_Name',
  name: 'Existing Name',
  timeout: '30m',
  type: StepType.EcsRollingDeploy
}
const onUpdate = jest.fn()
const onChange = jest.fn()
const formikRef = React.createRef<StepFormikRef<StepElementConfig>>()

describe('GenericExecutionStepEdit tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test(`renders fine for empty values and values can be changed`, async () => {
    const { container } = render(
      <TestWrapper>
        <ECSRollingDeployStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          onChange={onChange}
          ref={formikRef}
        />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string) => queryByAttribute('name', container, name)

    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).toBeInTheDocument()

    const nameInput = queryByNameAttribute('name') as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('')
    act((): void => {
      fireEvent.change(nameInput, { target: { value: 'Test Name' } })
    })
    expect(nameInput.value).toBe('Test Name')
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        identifier: 'Test_Name',
        name: 'Test Name',
        timeout: '',
        type: StepType.EcsRollingDeploy
      })
    )

    const timeoutInput = queryByNameAttribute('timeout') as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('')
    act(() => {
      fireEvent.change(timeoutInput, { target: { value: '20m' } })
    })
    expect(timeoutInput.value).toBe('20m')

    const sameAsAlreadyRunningInstancesCheckbox = queryByNameAttribute(
      'spec.sameAsAlreadyRunningInstances'
    ) as HTMLInputElement
    userEvent.click(sameAsAlreadyRunningInstancesCheckbox)

    const forceNewDeploymentCheckbox = queryByNameAttribute('spec.forceNewDeployment') as HTMLInputElement
    userEvent.click(forceNewDeploymentCheckbox)

    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Test_Name',
        name: 'Test Name',
        timeout: '20m',
        spec: {
          sameAsAlreadyRunningInstances: true,
          forceNewDeployment: true
        },
        type: StepType.EcsRollingDeploy
      })
    )
  })

  test(`change existing runtime value of timeout using cog`, async () => {
    const initialValues = {
      identifier: 'Existing_Name',
      name: 'Existing Name',
      type: StepType.EcsRollingDeploy,
      timeout: '10m',
      spec: {
        sameAsAlreadyRunningInstances: RUNTIME_INPUT_VALUE,
        forceNewDeployment: RUNTIME_INPUT_VALUE
      }
    }

    const { container } = render(
      <TestWrapper>
        <ECSRollingDeployStepEditRef
          initialValues={initialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={true}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={formikRef}
        />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string) => queryByAttribute('name', container, name)
    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const nameInput = queryByNameAttribute('name') as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('Existing Name')

    const timeoutInput = queryByNameAttribute('timeout') as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('10m')

    const cogSameAsAlreadyRunningInstances = document.getElementById(
      'configureOptions_spec.sameAsAlreadyRunningInstances'
    )
    userEvent.click(cogSameAsAlreadyRunningInstances!)
    await waitFor(() => expect(modals.length).toBe(1))
    const sameAsAlreadyRunningInstancesCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(sameAsAlreadyRunningInstancesCOGModal)

    const cogForceNewDeployment = document.getElementById('configureOptions_spec.forceNewDeployment')
    userEvent.click(cogForceNewDeployment!)
    await waitFor(() => expect(modals.length).toBe(1))
    const forceNewDeploymentCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(forceNewDeploymentCOGModal)

    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Existing_Name',
        name: 'Existing Name',
        timeout: '10m',
        spec: {
          sameAsAlreadyRunningInstances: '<+input>.regex(<+input>.includes(/test/))',
          forceNewDeployment: '<+input>.regex(<+input>.includes(/test/))'
        },
        type: StepType.EcsRollingDeploy
      })
    )
  })

  test('identifier should not be editable when isNewStep is false', () => {
    const { container } = render(
      <TestWrapper>
        <ECSRollingDeployStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          onChange={onChange}
          ref={formikRef}
        />
      </TestWrapper>
    )
    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).not.toBeInTheDocument()
  })

  test('onUpdate should not be called if it is not passed as prop', async () => {
    render(
      <TestWrapper>
        <ECSRollingDeployStepEditRef
          initialValues={existingInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onChange={onChange}
          ref={formikRef}
        />
      </TestWrapper>
    )
    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() => expect(onUpdate).not.toHaveBeenCalled())
  })
})
