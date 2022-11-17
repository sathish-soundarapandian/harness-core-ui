/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipContextProvider } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import StringWithTooltip, { StringWithTooltipProps } from '@common/components/StringWithTooltip/StringWithTooltip'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const renderComponent = (
  props: Partial<StringWithTooltipProps> = {},
  tooltips: Record<string, string> = { 'test-tooltip-id': 'test tooltip content' }
) =>
  render(
    <TestWrapper>
      <TooltipContextProvider initialTooltipDictionary={tooltips}>
        <StringWithTooltip stringId="test" tooltipId="test-tooltip-id" {...props} />
      </TooltipContextProvider>
    </TestWrapper>
  )

describe('StringWithTooltip', () => {
  test('it should render the string and include the correct data attribute', async () => {
    const stringId = 'test'
    const tooltipId = 'test-tooltip-id'
    renderComponent({ stringId, tooltipId })

    const subject = screen.getByText(stringId)
    expect(subject).toBeInTheDocument()
    expect(subject).toHaveAttribute('data-tooltip-id', tooltipId)
  })

  test('it should display the tooltip when the tooltip icon is clicked', async () => {
    const tooltipId = 'test-id'
    const tooltips = { [tooltipId]: 'test tooltip' }
    const { container } = renderComponent({ tooltipId }, tooltips)

    const icon = container.querySelector('.Tooltip--tooltipIcon') as Element
    expect(icon).toBeInTheDocument()
    expect(screen.queryByText(tooltips[tooltipId])).not.toBeInTheDocument()

    userEvent.click(icon)

    await waitFor(() => {
      expect(screen.getByText(tooltips[tooltipId])).toBeInTheDocument()
    })
  })

  test('it should not display the icon when the tooltip has no content', async () => {
    const { container } = renderComponent({ tooltipId: 'something-that-does-not-match' })

    expect(container.querySelector('.Tooltip--tooltipIcon')).not.toBeInTheDocument()
  })
})
