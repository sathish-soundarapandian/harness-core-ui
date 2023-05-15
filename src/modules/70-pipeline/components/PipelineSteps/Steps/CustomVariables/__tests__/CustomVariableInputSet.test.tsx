/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, queryByAttribute, queryByText, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import { MultiTypeInputType } from '@harness/uicore'

import { findPopoverContainer, TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { parseInput, InputSetFunction } from '@common/components/ConfigureOptions/ConfigureOptionsUtils'
import ipsWithDefaultValues from './inputSetsWithDefaultValues.json'
import { CustomVariableInputSet, CustomVariablesData } from '../CustomVariableInputSet'
import {
  concatValuesWithQuotes,
  MultiSelectVariableAllowedValues
} from '../MultiSelectVariableAllowedValues/MultiSelectVariableAllowedValues'

interface TestComponentProps {
  path?: string
  pathParams?: any
  initialValues: CustomVariablesData
  executionIdentifier?: string
  template?: CustomVariablesData
  allValues?: CustomVariablesData
  testWrapperProps?: TestWrapperProps
}

const validate = jest.fn()

function TestComponent(props: TestComponentProps): React.ReactElement {
  const { path, pathParams, testWrapperProps, ...rest } = props
  return (
    <TestWrapper path={path} pathParams={pathParams} {...testWrapperProps}>
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

describe('CustomVariable - Allowed values', () => {
  test('Allowed values multiselect - works correctly', async () => {
    const { container } = render(
      <TestComponent
        initialValues={{
          variables: [
            {
              name: 'stringComma',
              type: 'String',
              value: ''
            }
          ],
          canAddVariable: true
        }}
        template={{
          variables: [
            {
              name: 'stringComma',
              type: 'String',
              value: "<+input>.allowedValues(abc,\\'def, ghi\\',abc's\\xyz,\\'def'm, gh\\i\\',\\'1,2\\',\\'mnk)"
            }
          ]
        }}
        allValues={{
          variables: [
            {
              name: 'stringComma',
              type: 'String',
              value: "<+input>.allowedValues(abc,\\'def, ghi\\',abc's\\xyz,\\'def'm, gh\\i\\',\\'1,2\\',\\'mnk)"
            }
          ]
        }}
        testWrapperProps={{ defaultFeatureFlagValues: { PIE_MULTISELECT_AND_COMMA_IN_ALLOWED_VALUES: true } }}
      />
    )

    expect(container.querySelector('[data-testid="multiSelectVariableAllowedValues"')).toBeInTheDocument()
    expect(queryByText(container, 'stringComma')).toBeInTheDocument()

    await userEvent.click(container.querySelector('input[class*="bp3-input"')!)

    // MultiSelect component should appear
    const multiselectInputField = container.querySelector('.bp3-multi-select')
    expect(multiselectInputField).toBeInTheDocument()

    await userEvent.click(await screen.findByText('abc'))
    await userEvent.click(await screen.findByText("abc's\\xyz"))

    //tags should be visible
    expect(queryByText(container, 'abc')).toBeInTheDocument()
    expect(queryByText(container, "abc's\\xyz")).toBeInTheDocument()
  })

  test('test MultiSelectVariableAllowedValues component', async () => {
    const { container } = render(
      <TestWrapper>
        <MultiSelectVariableAllowedValues
          name={`multiSelectVariable`}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
          selectOption={[
            { label: 'run', value: 'run' },
            { label: 'a,b', value: 'a,b' },
            { label: "abc's\\xyz", value: "abc's\\xyz" },
            { label: "def'm, gh\\i", value: "def'm, gh\\i" },
            { label: "\\'mnk", value: "\\'mnk" }
          ]}
          onChange={jest.fn()}
          label=""
        />
      </TestWrapper>
    )
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    // MultiSelect component should appear
    const multiselectInputField = container.querySelector('.bp3-multi-select')
    expect(multiselectInputField).toBeInTheDocument()
    await userEvent.click(multiselectInputField as HTMLElement)
    await waitFor(() => expect(portalDivs.length).toBe(1))

    const dropdownPortalDiv = portalDivs[0]
    const selectListMenu = dropdownPortalDiv.querySelector('.bp3-menu')
    expect(queryByText(selectListMenu as HTMLElement, 'run')).toBeInTheDocument()
    expect(queryByText(selectListMenu as HTMLElement, 'a,b')).toBeInTheDocument()
    expect(queryByText(selectListMenu as HTMLElement, "abc's\\xyz")).toBeInTheDocument()
    expect(queryByText(selectListMenu as HTMLElement, "def'm, gh\\i")).toBeInTheDocument()
    expect(queryByText(selectListMenu as HTMLElement, "\\'mnk")).toBeInTheDocument()
  })

  test('test parsing and deparsing logic for string with commas', () => {
    const expectedSplit = ['a,b', "abc's\\\\xyz", "def'm, gh\\\\i", "\\\\'mnk"]
    const selectOptionsMixed = [
      {
        label: 'a,b',
        value: 'a,b'
      },
      {
        label: "abc's\\\\xyz",
        value: "abc's\\\\xyz"
      },
      {
        label: "def'm, gh\\\\i",
        value: "def'm, gh\\\\i"
      },
      {
        label: "\\\\'mnk",
        value: "\\\\'mnk"
      }
    ]

    const selectOptionsWithoutComma = [
      { label: 'a', value: 'a' },
      { label: 'test', value: 'test' }
    ]

    const selectOptionsNotString = [
      { label: '1', value: 1 },
      { label: 'a', value: 'a' }
    ]

    //without comma
    expect(concatValuesWithQuotes(selectOptionsWithoutComma)).toEqual('a,test')

    //irregular values
    expect(concatValuesWithQuotes('test' as any)).toEqual('test')
    expect(concatValuesWithQuotes(selectOptionsNotString)).toEqual('1,a')

    // mixed values
    const allowedValuesString = concatValuesWithQuotes(selectOptionsMixed)
    expect(allowedValuesString).toEqual(`\\'a,b\\',abc's\\\\xyz,\\'def'm, gh\\\\i\\',\\\\'mnk`)
    const allowedValuesExp = `<+input>.allowedValues(${allowedValuesString})`

    //deparsing
    const parsedValues = parseInput(allowedValuesExp, { variableType: 'String' as any })
    const finalValues = parsedValues?.[InputSetFunction.ALLOWED_VALUES]?.values
    expect(finalValues).toEqual(expectedSplit)
  })
})
