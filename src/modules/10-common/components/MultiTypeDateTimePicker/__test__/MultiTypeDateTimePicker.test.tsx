/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import { MultiTypeInputType, MultiTypeInputValue, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { Form, Formik } from 'formik'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import {
  FormMultiTypeDateTimePickerField,
  FormMultiTypeDateTimePickerProps,
  MultiTypeDateTimePickerProps
} from '../MultiTypeDateTimePicker'

interface TestProps extends Partial<FormMultiTypeDateTimePickerProps> {
  initialValues?: any
}

const renderComponent = (props: TestProps): RenderResult => {
  const { initialValues, ...restProps } = props
  return render(
    <TestWrapper>
      <Formik initialValues={initialValues} onSubmit={Promise.resolve}>
        <Form>
          <FormMultiTypeDateTimePickerField
            name="test"
            label="Time"
            multiTypeDateTimePicker={{
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
              expressions: ['']
            }}
            {...restProps}
          />
        </Form>
      </Formik>
    </TestWrapper>
  )
}

describe('MultiTypeDateTimePicker test', () => {
  test.each([MultiTypeInputType.RUNTIME, MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION])(
    'should display the %s icon in the button when set as type',
    async type => {
      renderComponent({ initialValues: {}, multiTypeDateTimePicker: { multitypeInputValue: type } })
      expect(screen.getByTestId('multi-type-button').querySelector('svg')).toMatchSnapshot()
    }
  )

  test('render MultiTypeDateTimePicker with defined formik', () => {
    const { container } = renderComponent({ initialValues: { test: '2023-06-07 06:20 PM' }, disabled: false })
    expect(container).toMatchSnapshot('MultiTypeDateTimePicker with defined formik')
  })

  test('render MultiTypeDateTimePicker with undefined formik', async () => {
    const { container } = render(
      <TestWrapper>
        <FormMultiTypeDateTimePickerField
          name="test"
          label="Time"
          multiTypeDateTimePicker={{
            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
            expressions: [''],
            multitypeInputValue: MultiTypeInputType.RUNTIME
          }}
        />
      </TestWrapper>
    )
    userEvent.click(screen.getByTestId('multi-type-button'))
    const fixedValueText = screen.getByText('Fixed value')
    await waitFor(() => expect(fixedValueText).toBeInTheDocument())
    userEvent.click(fixedValueText)
    await waitFor(() => expect(container).toMatchSnapshot('MultiTypeDateTimePicker with undefined formik'))
  })

  test('should only display specified types', async () => {
    const allowableTypes: MultiTypeDateTimePickerProps['allowableTypes'] = [
      MultiTypeInputType.FIXED,
      MultiTypeInputType.RUNTIME
    ]
    renderComponent({ initialValues: {}, multiTypeDateTimePicker: { allowableTypes } })

    expect(screen.queryByText('Fixed value')).not.toBeInTheDocument()
    expect(screen.queryByText('Runtime input')).not.toBeInTheDocument()
    expect(screen.queryByText('Expression')).not.toBeInTheDocument()

    userEvent.click(screen.getByTestId('multi-type-button'))
    await waitFor(() => {
      expect(screen.getByText('Fixed value')).toBeInTheDocument()
      expect(screen.getByText('Runtime input')).toBeInTheDocument()
      expect(screen.queryByText('Expression')).not.toBeInTheDocument()
    })
  })

  test('should call the onChange callback when an option is selected with value as defaultValue', async () => {
    const onChangeMock = jest.fn()
    renderComponent({ initialValues: {}, onChange: onChangeMock, defaultValueToReset: 'dummy' })
    expect(onChangeMock).not.toHaveBeenCalled()
    const multiTypeButton = screen.getByTestId('multi-type-button')

    userEvent.click(multiTypeButton)
    const runtimeInputText = screen.getByText('Runtime input')
    await waitFor(() => expect(runtimeInputText).toBeInTheDocument())
    userEvent.click(runtimeInputText)
    await waitFor(() =>
      expect(onChangeMock).toHaveBeenCalledWith(
        RUNTIME_INPUT_VALUE,
        MultiTypeInputValue.STRING,
        MultiTypeInputType.RUNTIME
      )
    )

    userEvent.click(multiTypeButton)
    const expressionValueText = screen.getByText('Expression')
    await waitFor(() => expect(expressionValueText).toBeInTheDocument())
    userEvent.click(expressionValueText)
    await waitFor(() =>
      expect(onChangeMock).toHaveBeenCalledWith('dummy', MultiTypeInputValue.STRING, MultiTypeInputType.EXPRESSION)
    )

    userEvent.click(multiTypeButton)
    const fixedValueText = screen.getByText('Fixed value')
    await waitFor(() => expect(fixedValueText).toBeInTheDocument())
    userEvent.click(fixedValueText)
    await waitFor(() =>
      expect(onChangeMock).toHaveBeenCalledWith('dummy', MultiTypeInputValue.STRING, MultiTypeInputType.FIXED)
    )
  })

  test('it should call the onChange callback with undefined value if defaultValue is not provided', async () => {
    const onChangeMock = jest.fn()
    renderComponent({
      initialValues: {},
      onChange: onChangeMock,
      multiTypeDateTimePicker: { multitypeInputValue: MultiTypeInputType.RUNTIME }
    })
    expect(onChangeMock).not.toHaveBeenCalled()

    userEvent.click(screen.getByTestId('multi-type-button'))
    const fixedValueText = screen.getByText('Fixed value')

    await waitFor(() => expect(fixedValueText).toBeInTheDocument())
    userEvent.click(fixedValueText)
    await waitFor(() =>
      expect(onChangeMock).toHaveBeenCalledWith(undefined, MultiTypeInputValue.STRING, MultiTypeInputType.FIXED)
    )
  })
})
