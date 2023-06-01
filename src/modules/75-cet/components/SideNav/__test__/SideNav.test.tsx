/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SideNav from '../SideNav'

describe('CET Sidenav', () => {
  test('render w/o project', () => {
    const { container } = render(
      <TestWrapper path={'/account/:accountId/cet/home'} pathParams={{ accountId: 'dummy' }}>
        <SideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render with project', () => {
    const { container } = render(
      <TestWrapper
        path={'/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier'}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <SideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
