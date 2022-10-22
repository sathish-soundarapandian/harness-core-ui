/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DurationView } from '../DurationView'

describe('Validate DurationView', () => {
  test('should render DurationView', () => {
    const { rerender } = render(
      <TestWrapper>
        <DurationView durationMs={600000} />
      </TestWrapper>
    )
    expect(screen.getByText('duration 10 mins')).toBeInTheDocument()
    rerender(
      <TestWrapper>
        <DurationView durationMs={105000} />
      </TestWrapper>
    )
    expect(screen.getByText('duration 1 min 45 secs')).toBeInTheDocument()
    rerender(
      <TestWrapper>
        <DurationView durationMs={3600000} />
      </TestWrapper>
    )
    expect(screen.getByText('duration 1 hr')).toBeInTheDocument()
    rerender(
      <TestWrapper>
        <DurationView durationMs={5400000} />
      </TestWrapper>
    )
    expect(screen.getByText('duration 1 hr 30 mins')).toBeInTheDocument()
    rerender(
      <TestWrapper>
        <DurationView durationMs={1000} />
      </TestWrapper>
    )
    expect(screen.getByText('duration 1 sec')).toBeInTheDocument()
    rerender(
      <TestWrapper>
        <DurationView />
      </TestWrapper>
    )
    expect(screen.getByText('duration noData')).toBeInTheDocument()
  })
})
