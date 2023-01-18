/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import EnvironmentTabs from '../EnvironmentTabs'

describe('Environment Tab', () => {
  test('renders Environment Group Tab', () => {
    const dummyPermissionsMap = new Map()
    dummyPermissionsMap.set(PermissionIdentifier.VIEW_ENVIRONMENT_GROUP, true)
    const { container } = render(
      <TestWrapper
        defaultPermissionValues={{
          permissions: dummyPermissionsMap,
          checkPermission: ({ permission }) =>
            dummyPermissionsMap.has(permission as string)
              ? (dummyPermissionsMap.get(permission as string) as boolean)
              : true
        }}
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/environment/"
        pathParams={{
          accountId: 'test',
          orgIdentifier: 'test',
          projectIdentifier: 'test'
        }}
      >
        <EnvironmentTabs />
      </TestWrapper>
    )
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="Layout--horizontal Layout--layout-spacing-small StyledProps--main TabNavigation--container"
        >
          <a
            class="TabNavigation--tags TabNavigation--small"
            href="/account/test/home/orgs/test/projects/test/environment"
          >
            environment
          </a>
          <a
            class="TabNavigation--tags TabNavigation--small"
            href="/account/test/home/orgs/test/projects/test/environment-group"
          >
            common.environmentGroups.label
          </a>
        </div>
      </div>
    `)
  })

  test('does not render Environment Group Tab', () => {
    const dummyPermissionsMap = new Map()
    dummyPermissionsMap.set(PermissionIdentifier.VIEW_ENVIRONMENT_GROUP, false)
    const { container } = render(
      <TestWrapper
        defaultPermissionValues={{
          permissions: dummyPermissionsMap,
          checkPermission: ({ permission }) =>
            dummyPermissionsMap.has(permission as string)
              ? (dummyPermissionsMap.get(permission as string) as boolean)
              : true
        }}
      >
        <EnvironmentTabs />
      </TestWrapper>
    )

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          class="Layout--horizontal Layout--layout-spacing-small StyledProps--main TabNavigation--container"
        >
          <a
            class="TabNavigation--tags TabNavigation--small"
            href="/account/undefined/environment"
          >
            environment
          </a>
        </div>
      </div>
    `)
  })
})
