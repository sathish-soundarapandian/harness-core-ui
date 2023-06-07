/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, getByText, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper, findPopoverContainer } from '@common/utils/testUtils'
import Snippet from '../Snippet'

const props = {
  key: 'sample',
  onSnippetCopy: jest.fn(),
  name: 'Sample snippet',
  version: '1.0',
  description: 'Sample snippet for testing'
}

describe('Snippet Test', () => {
  test('Initial render should match snapshots', () => {
    const { container } = render(
      <TestWrapper>
        <Snippet {...props} />
      </TestWrapper>
    )
    expect(getByText(container, 'Sample snippet')).toBeDefined()
    waitFor(() => {
      fireEvent.click(container?.querySelector("[class='copy']")!)
      const popover = findPopoverContainer()
      const fetching = getByText(popover as HTMLElement, 'Fetching')
      expect(fetching).toBeDefined()
    })
    expect(container).toMatchSnapshot()
  })
})
