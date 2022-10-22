/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { HandlerKind } from '@ce/constants'
import CustomTabContainer from '../CustomTabContainer'

const mockedFilters = [
  {
    kind: HandlerKind.path,
    path: ['testpath']
  },
  {
    kind: HandlerKind.ip,
    ipaddresses: ['1.2.3.4']
  }
]

describe('custom tab container tests', () => {
  test('should show custom exclusion details', () => {
    const data = {
      type: 'exclusion',
      filters: mockedFilters
    }
    const { getByText } = render(
      <TestWrapper>
        <CustomTabContainer data={data} />
      </TestWrapper>
    )

    expect(getByText('ce.co.ruleDetails.customTab.excludedPathHeader')).toBeDefined()
  })

  test('should show custom inclusion details', () => {
    const data = {
      type: 'inclusion',
      filters: mockedFilters
    }
    const { getByText } = render(
      <TestWrapper>
        <CustomTabContainer data={data} />
      </TestWrapper>
    )

    expect(getByText('ce.co.ruleDetails.customTab.includedPathHeader')).toBeDefined()
  })
})
