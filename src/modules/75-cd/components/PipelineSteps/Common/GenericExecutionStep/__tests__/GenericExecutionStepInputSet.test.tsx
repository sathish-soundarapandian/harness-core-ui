/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render } from '@testing-library/react'
import { Formik } from 'formik'
import { MultiTypeInputType } from '@harness/uicore'

import type { StepElementConfig } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { GenericExecutionStepInputSet } from '../GenericExecutionStepInputSet'

// type is not used in the component anywhere, just need to pass it as prop for typecheck to pass
const emptyInitialValues: StepElementConfig = { identifier: '', name: '', timeout: '', type: StepType.EcsRollingDeploy }
const handleSubmit = jest.fn()

describe('GenericExecutionStepInputSet tests', () => {
  test(`renders timeout field in InputSet view`, async () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValues} onSubmit={handleSubmit}>
          <GenericExecutionStepInputSet
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            inputSetData={{
              path: 'pipeline.stages[0].stage.spec.execution.steps[0].step',
              template: {
                identifier: 'Test_Name',
                name: 'Test Name',
                type: StepType.EcsRollingDeploy,
                timeout: '<+input>'
              }
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
    act(() => {
      fireEvent.change(timeoutInput, { target: { value: '20m' } })
    })
    expect(timeoutInput.value).toBe('20m')
  })

  test(`when readonly is true in InputSet view`, async () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValues} onSubmit={handleSubmit}>
          <GenericExecutionStepInputSet
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            inputSetData={{
              path: 'pipeline.stages[0].stage.spec.execution.steps[0].step',
              template: {
                identifier: 'Test_Name',
                name: 'Test Name',
                type: StepType.EcsRollingDeploy,
                timeout: '<+input>'
              },
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
  })

  test(`when template field is not present under inputSetData prop`, async () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValues} onSubmit={handleSubmit}>
          <GenericExecutionStepInputSet
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
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
  })

  test(`when path field is not present under inputSetData prop`, async () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValues} onSubmit={handleSubmit}>
          <GenericExecutionStepInputSet
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
            inputSetData={{
              template: {
                identifier: 'Test_Name',
                name: 'Test Name',
                type: StepType.EcsRollingDeploy,
                timeout: '<+input>'
              },
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
  })
})
