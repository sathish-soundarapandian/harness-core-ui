/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, queryByAttribute, queryByText } from '@testing-library/react'
import { Formik } from 'formik'
import { MultiTypeInputType } from '@harness/uicore'

import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import ipsWithDefaultValues from './inputSetsWithDefaultValues.json'
import { CustomVariableInputSet, CustomVariablesData } from '../CustomVariableInputSet'

interface TestComponentProps {
  path?: string
  pathParams?: any
  initialValues: CustomVariablesData
  executionIdentifier?: string
  template?: CustomVariablesData
  allValues?: CustomVariablesData
}

const validate = jest.fn()

function TestComponent(props: TestComponentProps): React.ReactElement {
  const { path, pathParams, ...rest } = props
  return (
    <TestWrapper path={path} pathParams={pathParams}>
      <Formik onSubmit={jest.fn()} validate={validate} initialValues={props.initialValues}>
        <CustomVariableInputSet
          {...rest}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]}
        />
      </Formik>
    </TestWrapper>
  )
}

describe('<CustomVariableInputSet /> tests', () => {
  test('renders correctly', async () => {
    const { container } = render(
      <TestComponent
        initialValues={{
          variables: [
            { name: 'var1', type: 'String', value: 'oldvalue1' },
            { name: 'var2', type: 'String', value: '<+input>' },
            { name: 'var3', type: 'String', value: 'oldvalue3' },
            { name: 'var4', type: 'String', value: '<+input>' }
          ]
        }}
        {...(ipsWithDefaultValues as any)}
      />
    )

    const queryByName = <T extends HTMLElement>(name: string): T | null =>
      queryByAttribute('name', container, name) as T

    expect(container).toMatchSnapshot()
    expect(queryByName<HTMLInputElement>('variables[0].value')?.value).toBe('oldvalue1')
    expect(queryByName<HTMLInputElement>('variables[1].value')?.value).toBe('<+input>')
    expect(queryByName<HTMLInputElement>('variables[2].value')?.value).toBe('oldvalue3')
    expect(queryByName<HTMLInputElement>('variables[3].value')?.value).toBe('<+input>')
  })

  test('works correctly', async () => {
    const { container } = render(
      <TestComponent
        initialValues={{ variables: [{ name: 'var', type: 'String', value: '<+input>' }] }}
        template={{ variables: [{ name: 'var', type: 'String', value: '<+input>' }] }}
        allValues={{ variables: [{ name: 'var', type: 'String', value: '<+input>' }] }}
      />
    )

    const changeInputsButton = container.querySelector(
      '.bp3-popover-wrapper.MultiTypeInput--wrapper button'
    ) as HTMLElement
    await act(async () => {
      fireEvent.click(changeInputsButton)
    })
    const popOver = findPopoverContainer() as HTMLElement
    const fixedValueButton = queryByText(popOver, 'Fixed value') as HTMLElement
    await act(async () => {
      fireEvent.click(fixedValueButton)
    })
    expect(validate).toBeCalledWith({ variables: [{ name: 'var', type: 'String', value: '' }] }, undefined)

    const lastVariableInput = container.querySelector('[name="variables[0].value"]') as HTMLElement
    expect(lastVariableInput).not.toHaveAttribute('disabled')
    await act(async () => {
      fireEvent.change(lastVariableInput, { target: { value: 'newValue' } })
    })
    expect(validate).toHaveBeenNthCalledWith(
      2,
      { variables: [{ name: 'var', type: 'String', value: 'newValue' }] },
      undefined
    )
  })
})
