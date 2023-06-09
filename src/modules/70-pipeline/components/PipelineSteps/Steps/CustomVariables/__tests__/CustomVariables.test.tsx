/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  queryByAttribute,
  fireEvent,
  act,
  waitFor,
  findByText as findByTextGlobal,
  findAllByText as findAllByTextGlobal,
  screen,
  within
} from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { listSecretsV2Promise } from 'services/cd-ng'
import { CustomVariables } from '../CustomVariables'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng')

const mockLongName_130 =
  'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'
const mockName_78 = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz'

describe('Custom Variables', () => {
  beforeAll(() => {
    factory.registerStep(new CustomVariables())
  })

  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ variables: [], canAddVariable: true }}
        type={StepType.CustomVariable}
        stepViewType={StepViewType.Edit}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('can add a string variable', async () => {
    const { container, findByText } = render(
      <TestStepWidget
        initialValues={{ variables: [], canAddVariable: true }}
        type={StepType.CustomVariable}
        stepViewType={StepViewType.Edit}
      />
    )

    const add = await findByText('common.addVariable')

    act(() => {
      fireEvent.click(add)
    })

    await waitFor(() => findAllByTextGlobal(document.body, 'common.addVariable'))

    const name = queryByAttribute('name', document.body.querySelector('.bp3-dialog') as HTMLElement, 'name')

    act(() => {
      fireEvent.change(name!, { target: { value: 'myVar' } })
    })
    const saveButton = await findByTextGlobal(document.body.querySelector('.bp3-dialog')!, 'save')

    act(() => {
      fireEvent.click(saveButton)
    })

    await waitFor(() => findByText('myVar'))

    const value = queryByAttribute('name', container, 'variables[0].value')

    act(() => {
      fireEvent.change(value!, { target: { value: 'myVarValue' } })
    })

    expect(container).toMatchSnapshot()
  })

  test('can add a variable of length - (0,128]', async () => {
    render(
      <TestStepWidget
        initialValues={{ variables: [], canAddVariable: true }}
        type={StepType.CustomVariable}
        stepViewType={StepViewType.Edit}
      />
    )

    const addBtn = await screen.findByText('common.addVariable')
    userEvent.click(addBtn)
    await screen.findByRole('heading', { name: 'variables.newVariable' })
    const view = screen.getByTestId('add-edit-variable')
    const saveVariableBtn = within(view).getByText('save')
    const variableNameTextBox = screen.getByPlaceholderText('pipeline.variable.variableNamePlaceholder')

    userEvent.type(variableNameTextBox, mockLongName_130)
    userEvent.click(saveVariableBtn)
    expect(await within(view).findByText('common.validation.fieldCannotbeLongerThanN')).toBeInTheDocument()

    userEvent.clear(variableNameTextBox)
    userEvent.type(variableNameTextBox, mockName_78)
    await waitFor(() => expect(within(view).queryByText('common.validation.fieldCannotbeLongerThanN')).toBeFalsy())
  })

  test('should render variables', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          variables: [
            { name: 'myVar1', type: 'String', value: 'myVar1Value' },
            { name: 'myVar1', type: 'Number', value: 1234 },
            { name: 'myVar1', type: 'Secret', value: RUNTIME_INPUT_VALUE }
          ],
          canAddVariable: true
        }}
        type={StepType.CustomVariable}
        stepViewType={StepViewType.StageVariable}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('can delete variable', async () => {
    const { container, findByTestId } = render(
      <TestStepWidget
        initialValues={{
          variables: [
            { name: 'myVar1', type: 'String', value: 'myVar1Value' },
            { name: 'myVar1', type: 'Number', value: 1234 },
            { name: 'myVar1', type: 'Secret', value: '<+input>' }
          ],
          canAddVariable: true
        }}
        type={StepType.CustomVariable}
        stepViewType={StepViewType.StageVariable}
      />
    )

    expect(container.querySelectorAll('.tableRow:not(.headerRow)').length).toBe(3)
    expect(container).toMatchSnapshot('Before Delete')

    const del = await findByTestId('delete-variable-2')

    act(() => {
      fireEvent.click(del)
    })

    expect(container.querySelectorAll('.tableRow:not(.headerRow)').length).toBe(2)
    expect(container).toMatchSnapshot('After Delete')
  })

  test('validates input set correctly', () => {
    const response = new CustomVariables().validateInputSet({
      data: {
        variables: [
          { name: 'myVar3', type: 'Secret', value: '' },
          { name: 'myVar4', type: 'String', value: '' },
          { name: 'myVar5', type: 'String', value: '' },
          { name: 'myVar6', type: 'String', value: 'myVar6Value' }
        ]
      },
      template: {
        variables: [{ value: '<+input>' }, { value: '<+input>' }, { value: '<+input>' }, { value: '<+input>' }]
      },
      viewType: StepViewType.DeploymentForm,
      allValues: {
        variables: [
          { name: 'myVar1', type: 'Number', value: NaN },
          { name: 'myVar2', type: 'String', value: 'myVar2Value' },
          { name: 'myVar3', type: 'Secret', value: '<+input>', required: true },
          { name: 'myVar4', type: 'String', value: '<+input>' },
          { name: 'myVar5', type: 'String', value: '<+input>', required: true },
          { name: 'myVar6', type: 'String', value: '<+input>', required: true }
        ]
      }
    })
    expect(response).toMatchSnapshot()
  })

  test('empty error object when default value present in number variable', () => {
    const response = new CustomVariables().validateInputSet({
      data: {
        variables: [{ name: 'myVar1', type: 'Number', value: 1, default: 1 }]
      },
      template: {
        variables: [{ value: '<+input>' }]
      },
      viewType: StepViewType.DeploymentForm
    })
    expect(response).toMatchSnapshot('default present in number variable')
  })

  test('handles secrets correctly', () => {
    ;(listSecretsV2Promise as any).mockResolvedValue({
      data: {
        content: [
          {
            secret: {
              name: 'test'
            }
          }
        ]
      }
    })
    const response = new CustomVariables().getSecretsListForYaml(
      'variables.0.value',
      `
      variables:
        - type: Secret
      `,
      {}
    )
    expect(response).toMatchSnapshot()
  })
})
