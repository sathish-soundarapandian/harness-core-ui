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
import CIModuleOverview from '../CIModuleOverview'

describe('ci module tests', () => {
  test('ci empty state collapsed', () => {
    const { queryByText } = render(
      <TestWrapper>
        <CIModuleOverview isExpanded={false} timeRange={DEFAULT_TIME_RANGE} isEmptyState />
      </TestWrapper>
    )

    expect(queryByText('common.moduleDetails.ci.collapsed.title')).not.toBeNull()
  })

  test('ci empty state expanded', () => {
    const { queryByText } = render(
      <TestWrapper>
        <CIModuleOverview isExpanded={true} timeRange={DEFAULT_TIME_RANGE} isEmptyState />
      </TestWrapper>
    )

    expect(queryByText('common.moduleDetails.ci.expanded.title')).not.toBeNull()
  })
})
