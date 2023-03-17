import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { RouteMappingStep, RouteType } from '../RouteMappingStep'
import { initialValues, runtimeValues, variableCustomStepProps } from './mocks'

const queryByNameAttribute = (container: HTMLElement, name: string): HTMLElement | null =>
  queryByAttribute('name', container, name)

factory.registerStep(new RouteMappingStep())
describe('Test TAS RouteMapping Steps', () => {
  test('should render edit view as new step - with initial snapshot', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.RouteMapping} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render in edit view and submit with initial values', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.RouteMapping}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )
    await act(async () => {
      fireEvent.change(queryByNameAttribute(container, 'name')!, { target: { value: 'Step1' } })
      fireEvent.change(queryByNameAttribute(container, 'timeout')!, { target: { value: '10m' } })
      fireEvent.change(queryByNameAttribute(container, 'spec.appName')!, { target: { value: 'appName1' } })

      const mappingTypeOption = container.querySelectorAll('input[type="radio"]')
      expect((mappingTypeOption[0] as HTMLInputElement).value).toBe(RouteType.Map)
      expect((mappingTypeOption[1] as HTMLInputElement).value).toBe(RouteType.UnMap)
      expect(mappingTypeOption[0] as HTMLInputElement).toBeChecked()
      const currentRunningBtn = mappingTypeOption[1] as HTMLInputElement
      currentRunningBtn.click()
      expect(mappingTypeOption[1] as HTMLInputElement).toBeChecked()

      await act(() => ref.current?.submitForm()!)
    })

    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step1',
      name: 'Step1',
      type: 'RouteMapping',
      timeout: '10m',
      spec: {
        appName: 'appName1',
        routeType: RouteType.UnMap,
        routes: ['route1']
      }
    })
  })

  test('edit view validation test', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          ...initialValues,
          timeout: '',
          spec: { routeType: RouteType.Map, appName: '', routes: [] }
        }}
        type={StepType.RouteMapping}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )
    await act(() => ref.current?.submitForm()!)
    await waitFor(() => {
      expect(container.querySelectorAll('.FormError--error').length).toEqual(3)
      expect(getByText('validation.timeout10SecMinimum')).toBeTruthy()
      expect(getByText('cd.steps.tas.routeMandatory')).toBeTruthy()
      expect(getByText('common.validation.fieldIsRequired')).toBeTruthy()
    })
  })
})
describe('TAS RouteMapping - runtime view and validation test', () => {
  test('should submit runtime values', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    render(
      <TestStepWidget
        initialValues={runtimeValues}
        type={StepType.RouteMapping}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )

    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'TASRouteMapping',
      name: 'TASRouteMapping',
      spec: {
        appName: RUNTIME_INPUT_VALUE,
        routeType: RouteType.Map,
        routes: RUNTIME_INPUT_VALUE
      },
      timeout: RUNTIME_INPUT_VALUE,
      type: 'RouteMapping'
    })
  })

  test('runtime view inputSet view', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={runtimeValues}
        type={StepType.RouteMapping}
        stepViewType={StepViewType.DeploymentForm}
        template={runtimeValues}
      />
    )
    expect(container).toMatchSnapshot()
    expect(container.querySelector('input[placeholder="cd.steps.tas.typeAndEnterForRouteAdd"]')).toBeTruthy()
  })

  test('Input set view validation for timeout', () => {
    const response = new RouteMappingStep().validateInputSet({
      data: {
        name: 'TASRouteMapping',
        identifier: 'TASRouteMapping',
        timeout: '1s',
        type: 'RouteMapping',
        spec: {
          routeType: RouteType.Map,
          appName: '',
          routes: ''
        }
      } as any,
      template: {
        timeout: RUNTIME_INPUT_VALUE,
        spec: {
          routeType: RouteType.Map,
          appName: RUNTIME_INPUT_VALUE,
          routes: RUNTIME_INPUT_VALUE
        }
      } as any,
      getString: jest.fn(),
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot('Value must be greater than or equal to "10s"')
    expect(response).toMatchSnapshot('Route is required')
  })
})

describe('TAS RouteMapping Step variable view ', () => {
  test('validate default inputVariables section', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: StepType.RouteMapping,
          name: 'TASRouteMapping',
          identifier: 'TASRouteMapping',
          description: 'sample description',
          timeout: '10m',
          spec: {
            appName: 'appName',
            routeType: RouteType.Map,
            routes: ['route1']
          }
        }}
        type={StepType.RouteMapping}
        stepViewType={StepViewType.InputVariable}
        customStepProps={variableCustomStepProps}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
