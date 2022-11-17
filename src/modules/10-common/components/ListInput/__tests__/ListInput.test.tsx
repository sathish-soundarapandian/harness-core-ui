/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import { ListInput } from '../ListInput'

const getListInputComponent = () => (
  <TestWrapper>
    {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
    <Formik initialValues={{ test: ['Element 1', 'Element 2'] }} onSubmit={() => {}} formName="TestWrapper">
      <FormikForm>
        <ListInput name="test" elementList={['Element 1', 'Element 2']} listItemRenderer={val => <div>{val}</div>} />
      </FormikForm>
    </Formik>
  </TestWrapper>
)

describe('ListInput tests', () => {
  test('Should render properly', async () => {
    const { getByTestId, container } = render(getListInputComponent())

    await act(async () => {
      const addBtn = getByTestId('add-test')
      expect(addBtn).toBeTruthy()
      fireEvent.click(addBtn)
    })

    await act(async () => {
      const removeBtn = getByTestId('remove-test-[1]')
      expect(removeBtn).toBeTruthy()
      fireEvent.click(removeBtn)
    })

    expect(container).toMatchSnapshot()
  })
})
