/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  fireEvent,
  waitFor,
  getByText as getByTextBody,
  getAllByText as getAllByTextBody,
  getByDisplayValue,
  queryByPlaceholderText,
  findByText,
  queryByText
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { ALLOWED_VALUES_TYPE, ConfigureOptions, ConfigureOptionsProps } from '../ConfigureOptions'

const onChange = jest.fn()

const getProps = (
  value: string,
  type: string | JSX.Element,
  variableName: string,
  isRequired = true,
  defaultValue = '',
  showDefaultField = true,
  showAdvanced = true
): ConfigureOptionsProps => ({
  value,
  isRequired,
  defaultValue,
  variableName,
  type,
  showDefaultField,
  showAdvanced,
  onChange
})

describe('Test ConfigureOptions', () => {
  test('should render configure options', async () => {
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions {...getProps(RUNTIME_INPUT_VALUE, 'test', 'var-test')} />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions_var-test')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    expect(dialog).toMatchSnapshot()
  })

  test('test invalid expression error', async () => {
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions {...getProps('', 'test', 'var-test')} />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions_var-test')
    fireEvent.click(btn as Element)
    await waitFor(() => getAllByTextBody(document.body, 'common.configureOptions.notValidExpression'))
    expect(getAllByTextBody(document.body, 'common.configureOptions.notValidExpression').length).toBe(2)
  })

  test('test invalid default for regular expression error', async () => {
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions {...getProps(`${RUNTIME_INPUT_VALUE}.regex(^a$)`, 'test', 'var-test', false, 'abc', true)} />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions_var-test')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    const submitBtn = getByTextBody(dialog, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => getByTextBody(document.body, 'common.configureOptions.validationErrors.defaultRegExValid'))
    expect(getByTextBody(document.body, 'common.configureOptions.validationErrors.defaultRegExValid')).toBeTruthy()
  })

  test('test valid default for regular expression error', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions {...getProps(`${RUNTIME_INPUT_VALUE}.regex(^abc$)`, 'test', 'var-test', true, 'abc')} />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions_var-test')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    const submitBtn = getByTextBody(dialog, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalledWith(`${RUNTIME_INPUT_VALUE}.regex(^abc$)`, 'abc', true)
  })

  test('test empty default for regular expression error', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions {...getProps(`${RUNTIME_INPUT_VALUE}.regex(^abc$)`, 'test', 'var-test', true, '')} />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions_var-test')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    const submitBtn = getByTextBody(dialog, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalledWith(`${RUNTIME_INPUT_VALUE}.regex(^abc$)`, '', true)
  })

  test('test invalid default for allowed values error', async () => {
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions
          {...getProps(`${RUNTIME_INPUT_VALUE}.allowedValues(abc,xyz)`, 'test', 'var-test', false, 'klm', true)}
        />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions_var-test')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    const submitBtn = getByTextBody(dialog, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => getByTextBody(document.body, 'common.configureOptions.validationErrors.defaultAllowedValid'))
    expect(getByTextBody(document.body, 'common.configureOptions.validationErrors.defaultAllowedValid')).toBeTruthy()
  })

  test('test valid default for allowed values error', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions
          {...getProps(`${RUNTIME_INPUT_VALUE}.allowedValues(abc,xyz)`, 'test', 'var-test', true, 'abc')}
        />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions_var-test')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    const submitBtn = getByTextBody(dialog, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalledWith(`${RUNTIME_INPUT_VALUE}.allowedValues(abc,xyz)`, 'abc', true)
  })

  test('test empty default for allowed values error', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions
          {...getProps(`${RUNTIME_INPUT_VALUE}.allowedValues(abc,xyz)`, 'test', 'var-test', true, '')}
        />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions_var-test')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    const submitBtn = getByTextBody(dialog, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalledWith(`${RUNTIME_INPUT_VALUE}.allowedValues(abc,xyz)`, '', true)
  })

  test('test regex expression', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions {...getProps(`${RUNTIME_INPUT_VALUE}.regex(^a$)`, 'test', 'var-test')} />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions_var-test')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    expect(dialog).toMatchSnapshot()
    const submitBtn = getByTextBody(dialog, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalledWith(`${RUNTIME_INPUT_VALUE}.regex(^a$)`, '', true)
  })

  test('test allowed values', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions
          {...getProps(`${RUNTIME_INPUT_VALUE}.allowedValues(abc,xyz)`, 'test', 'var-test')}
          showRequiredField={true}
        />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions_var-test')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    expect(dialog).toMatchSnapshot()
    const submitBtn = getByTextBody(dialog, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalledWith(`${RUNTIME_INPUT_VALUE}.allowedValues(abc,xyz)`, '', true)
  })

  test('test allowed advanced values', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions
          {...getProps(
            `${RUNTIME_INPUT_VALUE}.allowedValues(jexl(\${env.type} == “prod” ? aws1, aws2 : aws3, aws4))`,
            'test',
            'var-test'
          )}
          type={<div>Var Test</div>}
          showDefaultField={false}
        />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions_var-test')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    expect(dialog).toMatchSnapshot()
    const submitBtn = getByTextBody(dialog, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalledWith(
      `${RUNTIME_INPUT_VALUE}.allowedValues(jexl(\${env.type} == “prod” ? aws1, aws2 : aws3, aws4))`,
      '',
      true
    )
  })

  test('allowed values field should allow only numbers when allowedValuesType is passed as NUMBER', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions
          value={RUNTIME_INPUT_VALUE}
          variableName={'test'}
          type={'number'}
          showDefaultField={false}
          allowedValuesType={ALLOWED_VALUES_TYPE.NUMBER}
          onChange={onChange}
          defaultValue={''}
          isRequired={true}
        />
      </TestWrapper>
    )

    const btn = container.querySelector('#configureOptions_test')
    userEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'test'))

    // Click on Allowed Values radio
    const allowedValuesRadio = getByDisplayValue(dialog, 'AllowedValues')
    userEvent.click(allowedValuesRadio)

    // Check for Allowed Values input box
    const allowedValuesField = queryByPlaceholderText(
      dialog,
      'Type and press enter to create a tag'
    ) as HTMLInputElement
    await waitFor(() => expect(allowedValuesField).toBeInTheDocument())
    // Error case
    userEvent.type(allowedValuesField, '20s')
    fireEvent.keyDown(allowedValuesField, { key: 'enter', keyCode: 13 })
    const errorText = 'common.validation.onlyDigitsAllowed'
    const errorEl = await findByText(dialog, errorText)
    expect(errorEl).toBeInTheDocument()
    // Valid case - enter number here
    userEvent.clear(allowedValuesField)
    userEvent.type(allowedValuesField, '200')
    fireEvent.keyDown(allowedValuesField, { key: 'enter', keyCode: 13 })
    await waitFor(() => expect(queryByText(dialog, errorText)).not.toBeInTheDocument())

    // Click Submit
    const submitBtn = getByTextBody(dialog, 'submit')
    userEvent.click(submitBtn)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toHaveBeenCalledWith('<+input>.allowedValues(200)', '', true)
  })

  test('test dialog open and close', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions {...getProps(RUNTIME_INPUT_VALUE, 'test', 'var-test')} />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions_var-test')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    const closeBtn = dialog.querySelector('[data-icon="Stroke"]')
    fireEvent.click(closeBtn!)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalled()
  })

  test('test dialog open and cancel btn', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper>
        <ConfigureOptions {...getProps(RUNTIME_INPUT_VALUE, 'test', 'var-test')} />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions_var-test')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    onChange.mockReset()
    const cancelBtn = getByTextBody(dialog, 'cancel')
    fireEvent.click(cancelBtn)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalled()
  })

  test('runtime execution input', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper defaultFeatureFlagValues={{ NG_EXECUTION_INPUT: true }}>
        <ConfigureOptions {...getProps(`${RUNTIME_INPUT_VALUE}.executionInput()`, 'Number', 'var-test')} />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions_var-test')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    expect(dialog).toMatchSnapshot()
    const submitBtn = getByTextBody(dialog, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalledWith(`${RUNTIME_INPUT_VALUE}.executionInput()`, '', true)
  })

  test('default value via function', async () => {
    onChange.mockReset()
    const { container } = render(
      <TestWrapper defaultFeatureFlagValues={{ NG_EXECUTION_INPUT: true }}>
        <ConfigureOptions {...getProps(`${RUNTIME_INPUT_VALUE}.default(123)`, 'Number', 'var-test')} />
      </TestWrapper>
    )
    const btn = container.querySelector('#configureOptions_var-test')
    fireEvent.click(btn as Element)
    const dialog = findDialogContainer() as HTMLElement
    await waitFor(() => getByTextBody(dialog, 'var-test'))
    expect(dialog).toMatchSnapshot()
    const submitBtn = getByTextBody(dialog, 'submit')
    fireEvent.click(submitBtn)
    await waitFor(() => expect(onChange).toBeCalledTimes(1))
    expect(onChange).toBeCalledWith(`${RUNTIME_INPUT_VALUE}.default(123)`, 123, true)
  })
})
