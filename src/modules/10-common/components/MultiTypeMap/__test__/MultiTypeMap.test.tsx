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

import MultiTypeMap from '../MultiTypeMap'

interface TestProps {
  initialValues?: any
  appearance?: 'default' | 'minimal'
}

const TestComponent = ({ initialValues }: TestProps): React.ReactElement => (
  <TestWrapper>
    <Formik initialValues={initialValues} onSubmit={Promise.resolve}>
      <Form>
        <MultiTypeMap
          name="test"
          multiTypeFieldSelectorProps={{
            label: 'Test'
          }}
        />
      </Form>
    </Formik>
  </TestWrapper>
)

describe('<MultiTypeMap /> tests', () => {
  test('Renders ok with minimal UI', () => {
    const { container } = render(<TestComponent initialValues={{ test: [] }} appearance={'minimal'} />)
    expect(container).toMatchSnapshot()
  })

  test('+ Add button should add a new field', async () => {
    const { container, getByTestId } = render(<TestComponent initialValues={{ test: [] }} />)

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.click(getByTestId('add-test'))
      fireEvent.click(getByTestId('add-test'))
    })

    expect(queryByNameAttribute('test[0].key')).toBeTruthy()
    expect(queryByNameAttribute('test[0].value')).toBeTruthy()
    expect(queryByNameAttribute('test[1].key')).toBeTruthy()
    expect(queryByNameAttribute('test[1].value')).toBeTruthy()
  })

  test('Remove button should remove a field', async () => {
    const { container, getByTestId } = render(<TestComponent initialValues={{ test: [] }} />)

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.click(getByTestId('add-test'))
      fireEvent.click(getByTestId('add-test'))
    })

    await act(async () => {
      fireEvent.click(getByTestId('remove-test-[1]'))
    })

    expect(queryByNameAttribute('test[0].key')).toBeTruthy()
    expect(queryByNameAttribute('test[0].value')).toBeTruthy()
    expect(queryByNameAttribute('test[1].key')).toBeNull()
    expect(queryByNameAttribute('test[1].value')).toBeNull()
  })

  test('Should render properly', () => {
    const { container } = render(<TestComponent />)
    expect(container).toMatchSnapshot()
  })
})
