/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act, waitFor } from '@testing-library/react'
import { Form } from 'formik'
import { Formik, MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { MultiTypeExecutionCondition } from '../MultiTypeExecutionCondition'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
jest.mock('@common/components/MonacoTextField/MonacoTextField', () => ({
  MonacoTextField: function MonacoTextField() {
    return <textarea />
  }
}))

describe('MultiTypeExecutionCondition test', () => {
  test('input enabled and fixed, runtime multi types', () => {
    const { container } = render(
      <TestWrapper>
        <Formik formName="test-form" initialValues={{}} onSubmit={jest.fn()}>
          <Form>
            <MultiTypeExecutionCondition
              path={'condition'}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
              isInputDisabled={true}
              expressions={['']}
            />
          </Form>
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('input disabled and only fixed multi type', () => {
    const { container } = render(
      <TestWrapper>
        <Formik formName="test-form" initialValues={{}} onSubmit={jest.fn()}>
          <Form>
            <MultiTypeExecutionCondition
              path={'condition'}
              allowableTypes={[MultiTypeInputType.FIXED]}
              isInputDisabled={false}
              expressions={['']}
            />
          </Form>
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('input enabled and fixed, runtime multi types - onchange', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Formik formName="test-form" initialValues={{}} onSubmit={jest.fn()}>
          <Form>
            <MultiTypeExecutionCondition
              path={'condition'}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
              isInputDisabled={false}
              expressions={['']}
            />
          </Form>
        </Formik>
      </TestWrapper>
    )

    const multiInputTypeBtn = document.querySelector('.MultiTypeInput--btn')
    multiInputTypeBtn && fireEvent.click(multiInputTypeBtn)

    await waitFor(() => getByText('Runtime input'))

    act(() => {
      fireEvent.click(getByText('Runtime input'))
    })

    expect(await waitFor(() => container.querySelector('.MultiTypeInput--RUNTIME'))).toBeInTheDocument()
  })
})
