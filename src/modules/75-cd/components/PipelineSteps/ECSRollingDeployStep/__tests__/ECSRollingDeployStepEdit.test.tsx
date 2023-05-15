/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ECSRollingDeployStepElementConfig } from '@pipeline/utils/types'
import { ECSRollingDeployStepEditRef } from '../ECSRollingDeployStepEdit'

const emptyInitialValues: ECSRollingDeployStepElementConfig = {
  identifier: '',
  name: '',
  timeout: '',
  type: StepType.EcsRollingDeploy,
  spec: {
    forceNewDeployment: false,
    sameAsAlreadyRunningInstances: false
  }
}
const existingInitialValues: ECSRollingDeployStepElementConfig = {
  identifier: 'Existing_Name',
  name: 'Existing Name',
  timeout: '30m',
  type: StepType.EcsRollingDeploy,
  spec: {
    forceNewDeployment: false,
    sameAsAlreadyRunningInstances: false
  }
}
const runtimeInitialValues: ECSRollingDeployStepElementConfig = {
  identifier: 'Existing_Name',
  name: 'Existing Name',
  timeout: RUNTIME_INPUT_VALUE,
  type: StepType.EcsRollingDeploy,
  spec: {
    sameAsAlreadyRunningInstances: RUNTIME_INPUT_VALUE,
    forceNewDeployment: RUNTIME_INPUT_VALUE
  }
}

const onUpdate = jest.fn()
const onChange = jest.fn()
const formikRef = React.createRef<StepFormikRef<ECSRollingDeployStepElementConfig>>()

describe('ECSRollingDeployStepEdit tests', () => {
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
        type: StepType.EcsRollingDeploy,
        spec: {
          forceNewDeployment: false,
          sameAsAlreadyRunningInstances: false
        }
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
    await userEvent.click(sameAsAlreadyRunningInstancesCheckbox)

    const forceNewDeploymentCheckbox = queryByNameAttribute('spec.forceNewDeployment') as HTMLInputElement
    await userEvent.click(forceNewDeploymentCheckbox)

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

  test(`renders fine for Runtime values`, async () => {
    const { container } = render(
      <TestWrapper>
        <ECSRollingDeployStepEditRef
          initialValues={runtimeInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          onChange={onChange}
          ref={formikRef}
          isNewStep={false}
        />
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string) => queryByAttribute('name', container, name)

    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).not.toBeInTheDocument()

    const nameInput = queryByNameAttribute('name') as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('Existing Name')

    const timeoutInput = queryByNameAttribute('timeout') as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe(RUNTIME_INPUT_VALUE)

    act(() => {
      formikRef.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Existing_Name',
        name: 'Existing Name',
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          sameAsAlreadyRunningInstances: RUNTIME_INPUT_VALUE,
          forceNewDeployment: RUNTIME_INPUT_VALUE
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
