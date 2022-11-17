/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Container } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { SetupSourceLayout } from '../SetupSourceLayout'

describe('Unit tests for SetupSourceLayout', () => {
  test('Ensure that layout properly displays content without left and right panel', async () => {
    const { container } = render(
      <TestWrapper>
        <SetupSourceLayout content={<Container className="mainContent" />} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('.mainContent')).not.toBeNull())
    await waitFor(() => expect(container.querySelector('[class*="leftPanel"]')).not.toBeNull())
    await waitFor(() => expect(container.querySelector('[class*="rightPanel"]')).not.toBeNull())
  })
  test('Ensure that layout properly displays content with left and right panel', async () => {
    const { container } = render(
      <TestWrapper>
        <SetupSourceLayout
          content={<Container className="mainContent" />}
          leftPanelContent={<Container className="left" />}
          rightPanelContent={<Container className="right" />}
        />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('.mainContent')).not.toBeNull())
    await waitFor(() => expect(container.querySelector('[class*="leftPanel"]')).not.toBeNull())
    await waitFor(() => expect(container.querySelector('[class*="rightPanel"]')).not.toBeNull())
    await waitFor(() => expect(container.querySelector('[class*="left"]')).not.toBeNull())
    await waitFor(() => expect(container.querySelector('[class*="right"]')).not.toBeNull())
  })
})
