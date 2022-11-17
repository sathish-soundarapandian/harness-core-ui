/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, findByText, fireEvent, waitFor } from '@testing-library/react'
import { Formik, Form } from 'formik'

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import MultiTypeFieldSelector, { MultiTypeFieldSelectorProps } from './MultiTypeFieldSelector'

interface TestProps extends Omit<MultiTypeFieldSelectorProps, 'name' | 'label' | 'children'> {
  initialValues: any
  onSubmit(data: any): void
}

function TestComponent({ onSubmit, initialValues, ...props }: TestProps): React.ReactElement {
  return (
    <TestWrapper>
      <Formik onSubmit={onSubmit} initialValues={initialValues}>
        <Form>
          <MultiTypeFieldSelector name="test" label="Test Label" {...props}>
            <div data-testid="children">
              <input type="text" />
            </div>
          </MultiTypeFieldSelector>
          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </TestWrapper>
  )
}

describe('<MultiTypeFieldSelector /> tests', () => {
  test('"Fixed value" renders children', async () => {
    const onSubmit = jest.fn()
    const { container, getByTestId } = render(
      <TestComponent onSubmit={onSubmit} initialValues={{ test: 'Some Value' }} />
    )

    expect(container).toMatchSnapshot('Fixed value')
    expect(getByTestId('children')).toMatchInlineSnapshot(`
      <div
        data-testid="children"
      >
        <input
          type="text"
        />
      </div>
    `)
  })

  test('Change from "Fixed value" to "Runtime input" updates value', async () => {
    const onSubmit = jest.fn()
    const { container, getByTestId, getByText } = render(
      <TestComponent onSubmit={onSubmit} initialValues={{ test: 'Some Value' }} />
    )

    const fixedInputIcon = container.querySelector('span[data-icon="fixed-input"]')
    fireEvent.click(fixedInputIcon!)

    fireEvent.click(getByText('Runtime input'))

    expect(container).toMatchSnapshot('Runtime input')
    expect(() => getByTestId('children')).toThrow()

    const submit = await findByText(container, 'Submit')

    fireEvent.click(submit)

    await waitFor(() => Promise.resolve())

    expect(onSubmit).toHaveBeenCalledWith(
      {
        test: RUNTIME_INPUT_VALUE
      },
      expect.any(Object)
    )
  })

  test('"disableTypeSelection" does not render type selector', async () => {
    const onSubmit = jest.fn()
    const { container } = render(
      <TestComponent onSubmit={onSubmit} initialValues={{ test: RUNTIME_INPUT_VALUE }} disableTypeSelection />
    )

    expect(container).toMatchSnapshot()
  })

  test('Detects "Runtime input" correctly', async () => {
    const onSubmit = jest.fn()
    const { container, getByTestId } = render(
      <TestComponent onSubmit={onSubmit} initialValues={{ test: RUNTIME_INPUT_VALUE }} />
    )

    expect(container).toMatchSnapshot('inputTypes.RUNTIME')
    expect(() => getByTestId('children')).toThrow()
  })

  test('Change from "Runtime input" to "Fixed value" updates value', async () => {
    const onSubmit = jest.fn()
    const { container, getByTestId, getByText } = render(
      <TestComponent onSubmit={onSubmit} initialValues={{ test: RUNTIME_INPUT_VALUE }} />
    )

    const runtimeInputIcon = container.querySelector('span[data-icon="runtime-input"]')
    fireEvent.click(runtimeInputIcon!)

    fireEvent.click(getByText('Fixed value'))
    expect(container).toMatchSnapshot('inputTypes.FIXED')
    expect(getByTestId('children')).toMatchInlineSnapshot(`
      <div
        data-testid="children"
      >
        <input
          type="text"
        />
      </div>
    `)

    const submit = await findByText(container, 'Submit')

    fireEvent.click(submit)

    await waitFor(() => Promise.resolve())

    expect(onSubmit).toHaveBeenCalledWith(
      {
        test: undefined
      },
      expect.any(Object)
    )
  })
})
