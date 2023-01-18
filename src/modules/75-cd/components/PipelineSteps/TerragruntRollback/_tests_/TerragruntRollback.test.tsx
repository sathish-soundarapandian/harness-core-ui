/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByAttribute, render, waitFor } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { TerragruntRollback } from '../TerragruntRollback'

const mockGetCallFunction = jest.fn()
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  })
}))

const inputSetProps = {
  inputSetData: {
    template: {
      type: 'TerragruntRollback',
      name: 'Test A',
      identifier: 'Test_A',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        provisionerIdentifier: RUNTIME_INPUT_VALUE
      }
    },
    path: '',
    readonly: false
  },
  initialValues: {
    type: 'TerragruntRollback',
    name: 'Test A',
    identifier: 'Test_A',
    timeout: RUNTIME_INPUT_VALUE,

    spec: {
      provisionerIdentifier: RUNTIME_INPUT_VALUE
    }
  },
  onUpdate: jest.fn()
}

const variableViewProps = {
  initialValues: {
    spec: {}
  },
  template: {
    spec: {
      provisionerIdentifier: ''
    }
  },
  customStepProps: {
    stageIdentifier: 'qaStage',
    metadataMap: {
      'step-name': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.terragruntrollback.name',
          localName: 'step.terragruntrollback.name'
        }
      },

      'step-timeout': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.terragruntrollback.timeout',
          localName: 'step.terragruntrollback.timeout'
        }
      },
      'step-delegateSelectors': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.terragruntrollback.delegateSelectors',
          localName: 'step.terragruntrollback.delegateSelectors'
        }
      },
      'step-provisionerIdentifier': {
        yamlProperties: {
          fqn: 'pipeline.stages.qaStage.execution.steps.terragruntrollback.provisionerIdentifier',
          localName: 'step.terragruntrollback.provisionerIdentifier'
        }
      }
    },
    variablesData: {
      type: 'TerragruntRollback',
      name: 'step-name',
      identifier: 'Test_A',
      timeout: 'step-timeout',

      spec: {
        provisionerIdentifier: 'step-provisionerIdentifier',

        delegateSSelectors: ['test-1', 'test-2']
      }
    }
  },
  onUpdate: jest.fn()
}

describe('Test TerragruntRollback', () => {
  beforeEach(() => {
    factory.registerStep(new TerragruntRollback())
  })

  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.TerragruntRollback}
        stepViewType={StepViewType.Edit}
        isNewStep
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Basic functions - edit stage view', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerragruntRollback',
          name: '',
          identifier: '',
          timeout: '5s',
          spec: {
            provisionerIdentifier: '/test67'
          }
        }}
        type={StepType.TerragruntRollback}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onChange={jest.fn()}
        onUpdate={onUpdate}
      />
    )
    await act(() => ref.current?.submitForm()!)
    expect(getByText('pipelineSteps.stepNameRequired')).toBeTruthy()
    expect(getByText('common.validation.provisionerIdentifierPatternIsNotValid')).toBeTruthy()

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)
    fireEvent.change(queryByNameAttribute('name')!, { target: { value: 'Terragrunt Rollback step' } })
    act(() => {
      fireEvent.click(getByText('pipelineSteps.timeoutLabel'))
    })
    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '' } })

    await act(() => ref.current?.submitForm()!)
    expect(queryByText('validation.timeout10SecMinimum')).toBeTruthy()

    fireEvent.change(queryByNameAttribute('timeout')!, { target: { value: '20s' } })
  })

  test('Render edit view with runtime input values', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const onUpdate = jest.fn()
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerragruntRollback',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: RUNTIME_INPUT_VALUE,

          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.TerragruntRollback}
        stepViewType={StepViewType.Edit}
        ref={ref}
        onUpdate={onUpdate}
      />
    )
    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  test('Basic snapshot- InputSet mode', async () => {
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        template={inputSetProps.inputSetData.template}
        initialValues={inputSetProps.initialValues}
        type={StepType.TerragruntRollback}
        stepViewType={StepViewType.InputSet}
        inputSetData={inputSetProps.inputSetData}
      />
    )
    fireEvent.click(getByText('Submit'))
    await waitFor(() => queryByText('Errors'))
    expect(container).toMatchSnapshot('input set with errors')
  })

  test('Basic snapshot - input variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={variableViewProps.initialValues}
        customStepProps={variableViewProps.customStepProps}
        template={variableViewProps.template}
        type={StepType.TerragruntRollback}
        stepViewType={StepViewType.InputVariable}
        onUpdate={jest.fn()}
      />
    )
    expect(container).toMatchSnapshot('input variable view')
  })

  test('Minimum time cannot be less than 10s', () => {
    const response = new TerragruntRollback().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'TestA',
        timeout: '1s',
        type: 'TerragruntRollback',
        spec: {
          provisionerIdentifier: 'test'
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '<+input>',
        type: 'TerragruntRollback',
        spec: {
          provisionerIdentifier: '<+input>'
        }
      },
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot('Value must be greater than or equal to "10s"')
  })

  test('should render edit view for inputset with path', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerragruntRollback',
          name: 'Test A',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE
          }
        }}
        template={{
          type: 'TerragruntRollback',
          name: 'Test A',
          timeout: RUNTIME_INPUT_VALUE,
          spec: { provisionerIdentifier: RUNTIME_INPUT_VALUE }
        }}
        path={'/abc'}
        type={StepType.TerragruntRollback}
        stepViewType={StepViewType.InputSet}
        inputSetData={{ readonly: true, path: '/abc' }}
      />
    )
    expect(container.querySelector('input[name="/abc.timeout"]')).toBeDefined()
    expect(container.querySelector('input[name="/abc.spec.provisionerIdentifier"]')).toBeDefined()
  })
})
