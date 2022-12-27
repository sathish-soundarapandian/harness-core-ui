/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik, Form } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import { FormInstanceDropdown, InstanceDropdownField, InstanceTypes } from '../InstanceDropdownField'

const props = {
  label: 'Instance',
  name: 'instances',
  expressions: [],
  value: { type: InstanceTypes.Count, spec: { value: 10 } },
  onChange: jest.fn()
}

describe('Unit tests for InstanceDropdownField Component', () => {
  test('render the component', () => {
    const { container } = render(
      <TestWrapper>
        <InstanceDropdownField {...props} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render the Formik component', () => {
    const onSubmit = jest.fn()
    const initialValues = {
      instanceType: ''
    }
    const { container } = render(
      <TestWrapper>
        <Formik onSubmit={onSubmit} initialValues={initialValues}>
          <Form>
            <FormInstanceDropdown {...props} />
          </Form>
        </Formik>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
