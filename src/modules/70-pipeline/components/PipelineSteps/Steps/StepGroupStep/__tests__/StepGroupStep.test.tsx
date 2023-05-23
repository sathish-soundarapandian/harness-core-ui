/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createRef } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { StepGroupElementConfig } from 'services/pipeline-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { StepGroupStep, StepGroupWidgetRef } from '../StepGroupStep'

describe('<StepGroupStep />', () => {
  const stepGroupStep = new StepGroupStep()
  beforeAll(() => {
    factory.registerStep(stepGroupStep)
  })
  afterAll(() => {
    factory.deregisterStep(stepGroupStep.getType())
  })

  test('renders as expected in edit view', async () => {
    render(
      <TestStepWidget
        type={StepType.StepGroup}
        initialValues={{
          name: 'stepgroup1',
          identifier: 'stepgroup1',
          steps: [
            {
              step: {
                type: 'Wait',
                name: 'Wait_1',
                identifier: 'Wait_1',
                spec: {
                  duration: '10m'
                }
              }
            }
          ]
        }}
        isNewStep={false}
        stepViewType={StepViewType.Edit}
      />
    )

    expect(await screen.findByDisplayValue('stepgroup1')).toBeInTheDocument()
  })

  test('should validate name and call onUpdate with expected values', async () => {
    const onUpdate = jest.fn()
    const ref = createRef<StepFormikRef<StepGroupElementConfig>>()
    const { baseElement } = render(
      <TestWrapper>
        <StepGroupWidgetRef
          ref={ref}
          onUpdate={onUpdate}
          initialValues={{
            steps: [],
            identifier: '',
            name: ''
          }}
          stepViewType={StepViewType.Edit}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(baseElement.querySelector('[name="name"]')).toHaveValue(''))
    await act(async () => ref.current?.submitForm())
    expect(await screen.findByText(/common.validation.nameIsRequired/)).toBeInTheDocument()

    userEvent.type(baseElement.querySelector('[name="name"]') as HTMLInputElement, 'stepgroup')

    expect(await screen.findByDisplayValue('stepgroup')).toBeInTheDocument()
    await act(async () => ref.current?.submitForm())
    await waitFor(() =>
      expect(onUpdate).toBeCalledWith({
        identifier: 'stepgroup',
        name: 'stepgroup',
        steps: []
      })
    )
  })
})
