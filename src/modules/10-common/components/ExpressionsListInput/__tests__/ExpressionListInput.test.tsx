/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, queryByAttribute } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { errorCheck } from '@common/utils/formikHelpers'

import { ExpressionsListInput } from '../ExpressionsListInput'

jest.mock('@common/utils/formikHelpers', () => ({
  errorCheck: jest.fn()
}))

const getListInputComponent = () => (
  <TestWrapper>
    {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
    <Formik initialValues={{ test: ['Element 1', 'Element 2'] }} onSubmit={() => {}} formName="TestWrapper">
      <FormikForm>
        <ExpressionsListInput name="test" value={['Element 1', 'Element 2']} />
      </FormikForm>
    </Formik>
  </TestWrapper>
)

describe('ExpressionsListInput tests', () => {
  test('Should render properly with error', async () => {
    ;(errorCheck as jest.Mock).mockImplementation(() => true)
    const { container } = render(getListInputComponent())

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('test.0')!, { target: { value: '<+pipeline.name>' } })
    expect(container).toMatchSnapshot()
  })

  test('Should render properly without error', async () => {
    ;(errorCheck as jest.Mock).mockImplementation(() => false)
    const { container } = render(getListInputComponent())

    const queryByNameAttribute = (name: string): HTMLElement | null => queryByAttribute('name', container, name)

    fireEvent.change(queryByNameAttribute('test.0')!, { target: { value: '<+pipeline.name>' } })
    expect(container).toMatchSnapshot()
  })
})
