/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ALLOWED_VALUES_TYPE } from '@common/components/ConfigureOptions/constants'
import { RenderField } from '../AllowedValuesField'

const getString = (key: any): any => {
  return key
}

describe('RenderField test', () => {
  test('it should render KVTagInput if allowedValuesType is null', () => {
    const formik = {
      setErrors: jest.fn(),
      errors: {},
      setFieldTouched: jest.fn(),
      setFieldValue: jest.fn()
    }
    const { container } = render(
      <TestWrapper>
        <RenderField getString={getString} isReadonly={false} formik={formik as any} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('it should render KVTagInput if allowedValuesType is TIME', async () => {
    const formik = {
      setErrors: jest.fn(),
      errors: {},
      setFieldTouched: jest.fn(),
      setFieldValue: jest.fn()
    }

    const { container } = render(
      <TestWrapper>
        <RenderField
          getString={getString}
          allowedValuesType={ALLOWED_VALUES_TYPE.TIME}
          isReadonly={false}
          formik={formik as any}
        />
      </TestWrapper>
    )
    const inputEl = container.getElementsByTagName('input')[0]
    fireEvent.change(inputEl, { target: { value: '20s' } })
    // // { key: "Enter", code: 13, charCode: 13 }
    // await fireEvent.keyDown(inputEl, { key: 'Enter', code: 13, charCode: 13 })
    // // fireEvent.click()
    // expect(inputEl).toMatchSnapshot()
    //
    expect(container).toMatchSnapshot()
  })
})
