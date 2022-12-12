/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { queryByNameAttribute } from '@common/utils/testUtils'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { SwapRouteStep } from '../SwapRouteStep'

factory.registerStep(new SwapRouteStep())

const existingInitialValues = {
  type: StepType.SwapRoutes,
  name: 'Swap Route Step Default',
  identifier: 'Swap_Route_Step_Default',
  timeout: '10m',
  spec: {
    downSizeOldApplication: false
  }
}

const onUpdate = jest.fn()
const onChange = jest.fn()

describe('SwapRouteStep tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('Edit view renders fine', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.SwapRoutes}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )

    const nameInput = queryByNameAttribute('name', container)
    userEvent.type(nameInput!, 'Swap Route Step')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('Swap Route Step'))
    expect(getByText('Swap_Route_Step')).toBeInTheDocument()

    const timeoutInput = queryByNameAttribute('timeout', container)
    userEvent.clear(timeoutInput!)
    userEvent.type(timeoutInput!, '20m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('20m'))

    const downSizeOldApplicationCheckbox = queryByNameAttribute('spec.downSizeOldApplication', container)
    await waitFor(() => expect(downSizeOldApplicationCheckbox).not.toBeChecked())

    await act(() => ref.current?.submitForm()!)
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Swap_Route_Step',
        name: 'Swap Route Step',
        timeout: '20m',
        type: StepType.SwapRoutes,
        spec: {
          downSizeOldApplication: false
        }
      })
    )
  })

  test('should render edit view as edit step with all runtime inputs', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: StepType.SwapRoutes,
          identifier: 'Swap_Route_Step',
          name: 'Swap Route Step',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            upsizeInActiveApp: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.SwapRoutes}
        stepViewType={StepViewType.Edit}
        readonly
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('InputSet view renders fine', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Swap_Route_Step',
          name: 'Swap Route Step',
          timeout: '',
          type: StepType.SwapRoutes,
          spec: {
            downSizeOldApplication: RUNTIME_INPUT_VALUE
          }
        }}
        template={{
          identifier: 'Swap_Route_Step',
          name: 'Swap Route Step',
          timeout: RUNTIME_INPUT_VALUE,
          type: StepType.SwapRoutes,
          spec: {
            downSizeOldApplication: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.SwapRoutes}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
        inputSetData={{ path: '', readonly: true }}
      />
    )

    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()
    userEvent.click(submitBtn)
    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(onUpdate).not.toHaveBeenCalled()
    userEvent.type(timeoutInput!, '10m')
    userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Swap_Route_Step',
      name: 'Swap Route Step',
      timeout: '10m',
      type: StepType.SwapRoutes,
      spec: {
        downSizeOldApplication: RUNTIME_INPUT_VALUE
      }
    })
  })

  test('Variables view renders fine', async () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.SwapRoutes}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'testStage',
          variablesData: existingInitialValues,
          metadataMap: {
            'Swap Route Step Default': {
              yamlProperties: {
                fqn: 'pipeline.stages.testStage.execution.steps.SwapRoutesStep.name',
                localName: 'step.SwapRoutesStep.name'
              }
            },
            '10m': {
              yamlProperties: {
                fqn: 'pipeline.stages.testStage.execution.steps.SwapRoutesStep.timeout',
                localName: 'step.SwapRoute.timeout'
              }
            },
            false: {
              yamlProperties: {
                fqn: 'pipeline.stages.testStage.execution.steps.SwapRoutesStep.spec.downSizeOldApplication',
                localName: 'step.downSizeOldApplication'
              }
            }
          }
        }}
      />
    )
    expect(getByText('name')).toBeVisible()
    expect(getByText('Swap Route Step Default')).toBeVisible()
    expect(getByText('timeout')).toBeVisible()
    expect(getByText('10m')).toBeVisible()
  })
})
