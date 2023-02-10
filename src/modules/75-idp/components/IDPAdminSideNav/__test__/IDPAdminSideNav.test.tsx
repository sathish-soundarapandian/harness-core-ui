/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import IDPAdminSideNav from '../IDPAdminSideNav'

describe('IDP Sidenav', () => {
  test('render', () => {
    const { container, getByText } = render(
      <TestWrapper
        path={routes.toIDPAdmin({
          ...accountPathProps
        })}
        pathParams={{
          accountId: 'accountId'
        }}
      >
        <IDPAdminSideNav />
      </TestWrapper>
    )
    expect(getByText('getStarted')).toBeVisible()
    expect(container).toMatchSnapshot()
  })
})
