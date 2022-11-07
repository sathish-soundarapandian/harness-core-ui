/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import PeriodLength from '../PeriodLength'

describe('PeriodLength', () => {
  test('Validate with no props', () => {
    const { container } = render(
      <TestWrapper>
        <PeriodLength />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Validate with empty periodLengthType', () => {
    const { container } = render(
      <TestWrapper>
        <PeriodLength periodLengthType="" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Validate with empty periodType', () => {
    const { container } = render(
      <TestWrapper>
        <PeriodLength periodType="" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
