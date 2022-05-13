/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import Map from '../Map'

interface TestProps {
  initialValues?: any
  readonly?: boolean
}

const TestComponent = ({ initialValues, readonly }: TestProps): React.ReactElement => (
  <TestWrapper>
    {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
    <Formik initialValues={initialValues} onSubmit={() => {}} formName="TestComponent">
      <FormikForm>
        <Map name="test" disabled={!!readonly} />
      </FormikForm>
    </Formik>
  </TestWrapper>
)

// TODO: Need to add tests for displaying errors for the whole field + it's entities
describe('<Map /> tests', () => {
  test('+ Add button should add a new field', async () => {
    const { getByTestId } = render(<TestComponent initialValues={{ test: {} }} />)

    await act(async () => {
      fireEvent.click(getByTestId('add-test'))
    })

    expect(getByTestId('key-test-[0]')).toBeTruthy()
    expect(getByTestId('value-test-[0]')).toBeTruthy()
    expect(getByTestId('key-test-[1]')).toBeTruthy()
    expect(getByTestId('value-test-[1]')).toBeTruthy()
  })

  test('Remove button should remove a field', async () => {
    const { getByTestId, queryByTestId } = render(<TestComponent initialValues={{ test: {} }} />)

    await act(async () => {
      fireEvent.click(getByTestId('add-test'))
    })

    await act(async () => {
      fireEvent.click(getByTestId('remove-test-[1]'))
    })

    expect(getByTestId('key-test-[0]')).toBeTruthy()
    expect(getByTestId('value-test-[0]')).toBeTruthy()
    expect(queryByTestId('key-test-[1]')).toBeNull()
    expect(queryByTestId('value-test-[1]')).toBeNull()
  })

  test('Readonly mode works', async () => {
    const { container, getByTestId } = render(<TestComponent readonly={true} initialValues={{}} />)
    expect(container.querySelector('[data-testid="add-test"]')).toBeNull()
    expect(container.querySelector('[data-testid="remove-test-[0]"]')).toBeNull()
    expect((getByTestId('key-test-[0]') as HTMLInputElement).disabled).toBeTruthy()
    expect((getByTestId('value-test-[0]') as HTMLInputElement).disabled).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('Should render properly', () => {
    const { container } = render(<TestComponent initialValues={{}} />)
    expect(container).toMatchSnapshot()
  })
})
