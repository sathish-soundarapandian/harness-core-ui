/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DEFAULT_TIME_RANGE } from '@common/utils/momentUtils'
import STOModuleOverview from '../STOModuleOverview'

describe('sto module tests', () => {
  test('sto empty state collapsed', () => {
    const { queryByText } = render(
      <TestWrapper>
        <STOModuleOverview isExpanded={false} timeRange={DEFAULT_TIME_RANGE} isEmptyState />
      </TestWrapper>
    )

    expect(queryByText('common.moduleDetails.sto.collapsed.title')).not.toBeNull()
  })

  test('sto empty state expanded', () => {
    const { queryByText } = render(
      <TestWrapper>
        <STOModuleOverview isExpanded={true} timeRange={DEFAULT_TIME_RANGE} isEmptyState />
      </TestWrapper>
    )

    expect(queryByText('common.moduleDetails.sto.expanded.title')).not.toBeNull()
  })
})
