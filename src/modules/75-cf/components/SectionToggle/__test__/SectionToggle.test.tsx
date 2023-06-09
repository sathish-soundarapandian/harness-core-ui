/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, RenderResult } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SectionToggle from '@cf/components/SectionToggle/SectionToggle'

const renderComponent = (path = 'targets'): RenderResult =>
  render(
    <TestWrapper
      queryParams={{ activeEnvironment: 'test' }}
      path={`/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/target-management/${path}`}
      pathParams={{ accountId: 'testAcc', orgIdentifier: 'testOrg', projectIdentifier: 'testProject' }}
    >
      <SectionToggle />
    </TestWrapper>
  )

describe('SectionToggle', () => {
  test('it should render 2 links', async () => {
    renderComponent()

    expect(screen.getByRole('link', { name: 'cf.shared.targets' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'cf.shared.segments' })).toBeInTheDocument()
  })

  test('it should render with Targets selected', async () => {
    renderComponent()

    expect(screen.getByRole('link', { name: 'cf.shared.targets' })).toHaveClass('TabNavigation--active')
    expect(screen.getByRole('link', { name: 'cf.shared.segments' })).not.toHaveClass('TabNavigation--active')
  })

  test('it should render with Target Groups selected', async () => {
    renderComponent('target-groups')

    expect(screen.getByRole('link', { name: 'cf.shared.targets' })).not.toHaveClass('TabNavigation--active')
    expect(screen.getByRole('link', { name: 'cf.shared.segments' })).toHaveClass('TabNavigation--active')
  })
})
