/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CETActiveAgentsCard from '../overview/CETActiveAgentsCard'

// Tested component is MFE container so no actual tests
describe('CETActiveAgentsCard', () => {
  test('basic test', () => {
    const { container } = render(
      <TestWrapper>
        <CETActiveAgentsCard />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
