/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TooltipContextProvider } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import ListingPageHeading, { ListingPageHeadingProps } from '../ListingPageHeading'

const renderComponent = (
  heading: string,
  props: Partial<ListingPageHeadingProps> = {},
  tooltipDictionary: Record<string, string> = {}
): RenderResult =>
  render(
    <TestWrapper>
      <TooltipContextProvider initialTooltipDictionary={tooltipDictionary}>
        <ListingPageHeading {...props}>{heading}</ListingPageHeading>
      </TooltipContextProvider>
    </TestWrapper>
  )

describe('ListingPageHeading', () => {
  test('it should display the heading', async () => {
    const heading = 'Hello World'
    renderComponent(heading)

    const el = screen.getByRole('heading', { name: heading })
    expect(el).toBeInTheDocument()
    expect(el).not.toHaveAttribute('data-tooltip-id')
  })

  test('it should add the tooltip data attribute', async () => {
    const heading = 'Hello World'
    const tooltipId = 'test-tooltip-id'

    renderComponent(heading, { tooltipId })

    const el = screen.getByRole('heading', { name: heading })
    expect(el).toBeInTheDocument()
    expect(el).toHaveAttribute('data-tooltip-id', tooltipId)
  })
})
