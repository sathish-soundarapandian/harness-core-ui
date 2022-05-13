/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, queryByAttribute } from '@testing-library/react'
import { Formik, Form } from 'formik'

import { TestWrapper } from '@common/utils/testUtils'

import MultiTypeList from '../MultiTypeList'

interface TestProps {
  initialValues?: any
}

const TestComponent = ({ initialValues }: TestProps): React.ReactElement => (
  <TestWrapper>
    <Formik initialValues={initialValues} onSubmit={Promise.resolve}>
      <Form>
        <MultiTypeList
          name="test"
          multiTypeFieldSelectorProps={{
            label: 'Test'
          }}
        />
      </Form>
    </Formik>
  </TestWrapper>
)

describe('<MultiTypeList /> tests', () => {
  test('+ Add button should add a new field', async () => {
    const { container, getByTestId } = render(<TestComponent initialValues={{ test: [] }} />)

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    await act(async () => {
      fireEvent.click(getByTestId('add-test'))
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
      fireEvent.click(getByTestId('add-test'))
    })

    await act(async () => {
      fireEvent.click(getByTestId('remove-test-[1]'))
    })

    expect(queryByNameAttribute('test[0].value')).toBeTruthy()
    expect(queryByNameAttribute('test[1].value')).toBeNull()
  })

  test('Should render properly', () => {
    const { container } = render(<TestComponent />)
    expect(container).toMatchSnapshot()
  })
})
