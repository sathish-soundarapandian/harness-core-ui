/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react/display-name */

import React from 'react'
import { fireEvent, render, screen, waitFor, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipContextProvider, TooltipContextProviderProps } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import SectionToggle from '@cf/components/SectionToggle/SectionToggle'

const renderComponent = (
  path = 'targets',
  tooltips: TooltipContextProviderProps['initialTooltipDictionary'] = { 'test-tooltip-id': 'test tooltip content' }
): RenderResult =>
  render(
    <TestWrapper
      queryParams={{ activeEnvironment: 'test' }}
      path={`/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/target-management/${path}`}
      pathParams={{ accountId: 'testAcc', orgIdentifier: 'testOrg', projectIdentifier: 'testProject' }}
    >
      <TooltipContextProvider initialTooltipDictionary={tooltips}>
        <SectionToggle />
      </TooltipContextProvider>
    </TestWrapper>
  )

describe('SectionToggle', () => {
  test('it should render 2 links', async () => {
    renderComponent()
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.getByText('cf.shared.targets').parentElement?.getAttribute('href')).toContain(
      '/target-management/targets'
    )
    expect(screen.getByText('cf.shared.segments').parentElement?.getAttribute('href')).toContain(
      '/target-management/target-groups'
    )
  })

  test('it should render with Targets selected', async () => {
    renderComponent()
    expect(screen.getByText('cf.shared.targets').parentElement).toHaveClass('active')
    expect(screen.getByText('cf.shared.segments').parentElement).not.toHaveClass('active')
  })

  test('it should render with Target Groups selected', async () => {
    renderComponent('target-groups')
    expect(screen.getByText('cf.shared.segments').parentElement).toHaveClass('active')
    expect(screen.getByText('cf.shared.targets').parentElement).not.toHaveClass('active')
  })

  test('it should not be rendered again when clicking the link within its tooltip', async () => {
    const targetsToolTip = '[targets-doc-link](#)'
    const linkOnClick = jest.fn()

    renderComponent('targets', { ff_targets_heading: targetsToolTip })
    ;([...document.querySelectorAll('a')] as HTMLAnchorElement[]).forEach(tag => (tag.onclick = linkOnClick))

    const icon = document.querySelector('.Tooltip--tooltipIcon') as SVGElement
    expect(icon).toBeInTheDocument()
    fireEvent.mouseOver(icon)

    await waitFor(() => expect(screen.getByRole('link', { name: 'targets-doc-link' })).toBeInTheDocument())

    userEvent.click(screen.getByRole('link', { name: 'targets-doc-link' }))

    await waitFor(() => expect(linkOnClick).not.toHaveBeenCalled(), { timeout: 3000 })
  })
})
