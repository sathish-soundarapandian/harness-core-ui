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
import CFModuleOverview from '../CFModuleOverview'

describe('cf module tests', () => {
  test('cf empty state collapsed', () => {
    const { queryByText } = render(
      <TestWrapper>
        <CFModuleOverview isExpanded={false} timeRange={DEFAULT_TIME_RANGE} isEmptyState />
      </TestWrapper>
    )

    expect(queryByText('common.moduleDetails.ff.collapsed.title')).not.toBeNull()
  })

  test('cf empty state expanded', () => {
    const { queryByText } = render(
      <TestWrapper>
        <CFModuleOverview isExpanded={true} timeRange={DEFAULT_TIME_RANGE} isEmptyState />
      </TestWrapper>
    )

    expect(queryByText('common.moduleDetails.ff.expanded.title')).not.toBeNull()
  })
})
