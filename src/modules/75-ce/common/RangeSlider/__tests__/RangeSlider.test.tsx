/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color } from '@harness/design-system'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import RangeSlider from '../RangeSlider'

describe('Range slider', () => {
  test('render successfully', () => {
    const { container } = render(
      <TestWrapper>
        <RangeSlider
          onChange={jest.fn()}
          lowFillColor={Color.AQUA_500}
          trackColor={Color.BLACK}
          rangeProps={{ value: 50 }}
        />
      </TestWrapper>
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  test('render with default values', () => {
    const { container } = render(
      <TestWrapper>
        <RangeSlider onChange={jest.fn()} />
      </TestWrapper>
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})
