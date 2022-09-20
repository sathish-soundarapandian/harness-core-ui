/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render } from '@testing-library/react'
import { Formik } from 'formik'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ECSRollingDeployStepInitialValues } from '@pipeline/utils/types'
import { ECSRollingDeployStepInputSet } from '../ECSRollingDeployStepInputSet'

// type is not used in the component anywhere, just need to pass it as prop for typecheck to pass
const emptyInitialValues: ECSRollingDeployStepInitialValues = {
  identifier: '',
  name: '',
  timeout: '',
  type: StepType.EcsRollingDeploy
}
const template: ECSRollingDeployStepInitialValues = {
  identifier: 'Test_Name',
  name: 'Test Name',
  type: StepType.EcsRollingDeploy,
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    sameAsAlreadyRunningInstances: RUNTIME_INPUT_VALUE,
    forceNewDeployment: RUNTIME_INPUT_VALUE
  }
}
const handleSubmit = jest.fn()

describe('GenericExecutionStepInputSet tests', () => {
  test(`renders Runtime input fields in InputSet view`, async () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValues} onSubmit={handleSubmit}>
          <ECSRollingDeployStepInputSet
            initialValues={emptyInitialValues}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            readonly={false}
            stepViewType={StepViewType.InputSet}
            inputSetData={{
              path: 'pipeline.stages[0].stage.spec.execution.steps[0].step',
              template: template
            }}
          />
        </Formik>
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string) => queryByAttribute('name', container, name)

    const timeoutInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.timeout'
    ) as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('')
    expect(timeoutInput).not.toBeDisabled()

    const sameAsAlreadyRunningInstancesCheckbox = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.sameAsAlreadyRunningInstances'
    ) as HTMLInputElement
    expect(sameAsAlreadyRunningInstancesCheckbox).toBeInTheDocument()
    expect(sameAsAlreadyRunningInstancesCheckbox).not.toBeDisabled()

    const forceNewDeploymentCheckbox = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.forceNewDeployment'
    ) as HTMLInputElement
    expect(forceNewDeploymentCheckbox).toBeInTheDocument()
    expect(forceNewDeploymentCheckbox).not.toBeDisabled()

    act(() => {
      fireEvent.change(timeoutInput, { target: { value: '20m' } })
    })
    expect(timeoutInput.value).toBe('20m')
  })

  test(`when readonly is true in InputSet view`, async () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValues} onSubmit={handleSubmit}>
          <ECSRollingDeployStepInputSet
            initialValues={emptyInitialValues}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            stepViewType={StepViewType.InputSet}
            inputSetData={{
              path: 'pipeline.stages[0].stage.spec.execution.steps[0].step',
              template: template,
              readonly: true
            }}
          />
        </Formik>
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string) => queryByAttribute('name', container, name)

    const timeoutInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.timeout'
    ) as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('')
    expect(timeoutInput).toBeDisabled()

    const sameAsAlreadyRunningInstancesCheckbox = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.sameAsAlreadyRunningInstances'
    ) as HTMLInputElement
    expect(sameAsAlreadyRunningInstancesCheckbox).toBeInTheDocument()
    expect(sameAsAlreadyRunningInstancesCheckbox).toBeDisabled()

    const forceNewDeploymentCheckbox = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.forceNewDeployment'
    ) as HTMLInputElement
    expect(forceNewDeploymentCheckbox).toBeInTheDocument()
    expect(forceNewDeploymentCheckbox).toBeDisabled()
  })

  test(`when template field is not present under inputSetData prop`, async () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValues} onSubmit={handleSubmit}>
          <ECSRollingDeployStepInputSet
            initialValues={emptyInitialValues}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            stepViewType={StepViewType.InputSet}
            inputSetData={{
              path: 'pipeline.stages[0].stage.spec.execution.steps[0].step',
              readonly: true
            }}
          />
        </Formik>
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string) => queryByAttribute('name', container, name)

    const timeoutInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.timeout'
    ) as HTMLInputElement
    expect(timeoutInput).not.toBeInTheDocument()

    const sameAsAlreadyRunningInstancesCheckbox = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.sameAsAlreadyRunningInstances'
    ) as HTMLInputElement
    expect(sameAsAlreadyRunningInstancesCheckbox).not.toBeInTheDocument()

    const forceNewDeploymentCheckbox = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.forceNewDeployment'
    ) as HTMLInputElement
    expect(forceNewDeploymentCheckbox).not.toBeInTheDocument()
  })

  test(`when path field is not present under inputSetData prop`, async () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValues} onSubmit={handleSubmit}>
          <ECSRollingDeployStepInputSet
            initialValues={emptyInitialValues}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            stepViewType={StepViewType.InputSet}
            inputSetData={{
              template: template,
              readonly: false
            }}
          />
        </Formik>
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string) => queryByAttribute('name', container, name)

    const timeoutInput = queryByNameAttribute('timeout') as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('')
    expect(timeoutInput).not.toBeDisabled()

    const sameAsAlreadyRunningInstancesCheckbox = queryByNameAttribute(
      'spec.sameAsAlreadyRunningInstances'
    ) as HTMLInputElement
    expect(sameAsAlreadyRunningInstancesCheckbox).toBeInTheDocument()
    expect(sameAsAlreadyRunningInstancesCheckbox).not.toBeDisabled()

    const forceNewDeploymentCheckbox = queryByNameAttribute('spec.forceNewDeployment') as HTMLInputElement
    expect(forceNewDeploymentCheckbox).toBeInTheDocument()
    expect(forceNewDeploymentCheckbox).not.toBeDisabled()
  })
})
