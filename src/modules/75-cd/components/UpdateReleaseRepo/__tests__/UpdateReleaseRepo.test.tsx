/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { UpdateReleaseRepo } from '../UpdateReleaseRepo'

describe('Test UpdateReleaseRepoStep', () => {
  beforeEach(() => {
    factory.registerStep(new UpdateReleaseRepo())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.GitOpsUpdateReleaseRepo} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('expand override config panel', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.GitOpsUpdateReleaseRepo} stepViewType={StepViewType.Edit} />
    )
    const element = container.querySelector('[data-testid=optional-config-summary]')
    fireEvent.click(element!)
    expect(container).toMatchSnapshot()
  })

  test('should render edit view as edit step', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: StepType.GitOpsUpdateReleaseRepo,
          name: 'Test A',
          identifier: 'Test_A',
          timeout: RUNTIME_INPUT_VALUE,

          spec: {
            variables: [
              {
                name: 'test',
                type: 'string',
                value: 'abc'
              }
            ]
          }
        }}
        type={StepType.GitOpsUpdateReleaseRepo}
        stepViewType={StepViewType.Edit}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('should render edit view as edit step, expand ooptional panel', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: StepType.GitOpsUpdateReleaseRepo,
          name: 'Test A',
          identifier: 'Test_A',
          timeout: RUNTIME_INPUT_VALUE,

          spec: {
            variables: [
              {
                name: 'test',
                type: 'string',
                value: 'abc'
              }
            ]
          }
        }}
        type={StepType.GitOpsUpdateReleaseRepo}
        stepViewType={StepViewType.Edit}
      />
    )

    const element = container.querySelector('[data-testid=optional-config-summary]')
    fireEvent.click(element!)
    expect(container).toMatchSnapshot()
  })

  test('should render edit view as edit step with runtime inputs', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: StepType.GitOpsUpdateReleaseRepo,
          name: 'Test A',
          identifier: 'Test_A',
          timeout: RUNTIME_INPUT_VALUE,

          spec: {
            variables: [
              {
                name: 'test',
                type: 'string',
                value: RUNTIME_INPUT_VALUE
              }
            ]
          }
        }}
        template={{
          type: StepType.GitOpsUpdateReleaseRepo,
          name: 'Test A',
          identifier: 'Test_A',
          timeout: RUNTIME_INPUT_VALUE,

          spec: {
            variables: [
              {
                name: 'test',
                type: 'string',
                value: RUNTIME_INPUT_VALUE
              }
            ]
          }
        }}
        type={StepType.GitOpsUpdateReleaseRepo}
        stepViewType={StepViewType.InputSet}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('should render edit view as edit step with runtime inputs when no variables', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: StepType.GitOpsUpdateReleaseRepo,
          name: 'Test A',
          identifier: 'Test_A',
          timeout: RUNTIME_INPUT_VALUE,

          spec: {
            variables: []
          }
        }}
        template={{
          type: StepType.GitOpsUpdateReleaseRepo,
          name: 'Test A',
          identifier: 'Test_A',
          timeout: RUNTIME_INPUT_VALUE,

          spec: {
            variables: []
          }
        }}
        type={StepType.GitOpsUpdateReleaseRepo}
        stepViewType={StepViewType.InputSet}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: StepType.GitOpsUpdateReleaseRepo,
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',

          spec: {
            variables: [
              {
                name: 'test',
                type: 'string',
                value: RUNTIME_INPUT_VALUE
              }
            ]
          }
        }}
        template={{
          type: StepType.GitOpsUpdateReleaseRepo,
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',

          spec: {
            variables: [
              {
                name: 'test',
                type: 'string',
                value: RUNTIME_INPUT_VALUE
              }
            ]
          }
        }}
        allValues={{
          type: StepType.GitOpsUpdateReleaseRepo,
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',

          spec: {
            variables: [
              {
                name: 'test',
                type: 'string',
                value: RUNTIME_INPUT_VALUE
              }
            ]
          }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.updateReleaseRepo.name',
                localName: 'step.updateReleaseRepo.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.updateReleaseRepo.timeout',
                localName: 'step.updateReleaseRepo.timeout'
              }
            },
            'step-updateConfigScript': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.updateReleaseRepo.updateConfigScript',
                localName: 'step.updateReleaseRepo.updateConfigScript'
              }
            }
          },
          variablesData: {
            type: StepType.GitOpsUpdateReleaseRepo,
            name: 'step-name',
            identifier: 'Test_A',
            timeout: 'step-timeout',

            spec: {
              variables: [
                {
                  name: 'test',
                  type: 'string',
                  value: RUNTIME_INPUT_VALUE
                }
              ]
            }
          }
        }}
        type={StepType.GitOpsUpdateReleaseRepo}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view', () => {
    const initialValues = {
      type: StepType.GitOpsUpdateReleaseRepo,
      identifier: 'test',
      name: 'test',
      spec: {
        variables: [
          {
            name: 'testInput1',
            type: 'String',
            value: 'Test_A'
          },
          {
            name: 'testInput2',
            type: 'String',
            value: 'Test_B'
          }
        ]
      }
    }
    const { container } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.GitOpsUpdateReleaseRepo}
        stepViewType={StepViewType.Edit}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('form produces correct data for fixed inputs', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.GitOpsUpdateReleaseRepo}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'test' } })

      fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '10m' } })

      await fireEvent.click(getByText('common.optionalConfig'))
      await fireEvent.click(getByText('common.addVariable'))

      fireEvent.change(queryByNameAttribute('spec.variables[0].name')!, { target: { value: 'testInput1' } })
      fireEvent.change(queryByNameAttribute('spec.variables[0].value')!, {
        target: { value: 'testInputValue' }
      })
      fireEvent.change(queryByNameAttribute('spec.variables[0].type')!, { target: { value: 'String' } })

      await ref.current?.submitForm()
    })

    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'test',
      name: 'test',
      timeout: '10m',
      type: StepType.GitOpsUpdateReleaseRepo,
      spec: {
        variables: [
          {
            name: 'testInput1',
            type: 'String',
            value: 'testInputValue'
          }
        ]
      }
    })
  })

  test('renders empty inputVariables', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.GitOpsUpdateReleaseRepo}
        stepViewType={StepViewType.InputVariable}
        customStepProps={{}}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
