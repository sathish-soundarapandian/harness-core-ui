/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, queryByAttribute } from '@testing-library/react'
import { Formik, Form } from 'formik'

import { TestWrapper } from '@common/utils/testUtils'

import MultiTypeListInputSet from '../MultiTypeListInputSet'

interface TestProps {
  initialValues?: any
  multiTypeListInputSetProps?: { persistEmptyStringDefault?: boolean }
}

const TestComponent = ({ initialValues, multiTypeListInputSetProps = {} }: TestProps): React.ReactElement => (
  <TestWrapper>
    <Formik initialValues={initialValues} onSubmit={Promise.resolve}>
      {formik => (
        <Form>
          <MultiTypeListInputSet
            name="test"
            multiTypeFieldSelectorProps={{
              label: 'Test'
            }}
            formik={formik}
            {...multiTypeListInputSetProps}
          />
        </Form>
      )}
    </Formik>
  </TestWrapper>
)

describe('<MultiTypeListInputSet /> tests', () => {
  test('+ Add button should add a new field', async () => {
    const { container, getByTestId } = render(<TestComponent initialValues={{ test: [] }} />)

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.click(getByTestId('add-test'))
    })

    expect(queryByNameAttribute('test[0].value')).toBeTruthy()
    expect(queryByNameAttribute('test[1].value')).toBeTruthy()
  })

  test('Remove button should remove a field', async () => {
    const { container, getByTestId } = render(<TestComponent initialValues={{ test: [] }} />)

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.click(getByTestId('add-test'))
    })

    await act(async () => {
      fireEvent.click(getByTestId('remove-test-[1]'))
    })

    expect(queryByNameAttribute('test[0].value')).toBeTruthy()
    expect(queryByNameAttribute('test[1].value')).toBeNull()
  })

  test('Should render properly', () => {
    const { container } = render(<TestComponent initialValues={{}} />)
    expect(container).toMatchSnapshot()
  })

  test('Should render correct value onChange', async () => {
    const { container } = render(<TestComponent initialValues={{ test: '' }} />)
    const input = document.querySelector('[name="test[0].value"]')
    if (input) {
      fireEvent.change(input, { target: { value: 'testVal' } })
    }
    expect(container).toMatchSnapshot()
  })

  test('Should reset existing value to empty string', async () => {
    render(
      <TestComponent
        initialValues={{ test: ['abc'] }}
        multiTypeListInputSetProps={{ persistEmptyStringDefault: true }}
      />
    )
    const input = document.querySelector('[name="test[0].value"]')
    expect(input?.getAttribute('value')).toBe('abc')
    if (input) {
      fireEvent.change(input, { target: { value: '' } })
    }
    expect(input?.getAttribute('value')).toBe('')
  })
})
