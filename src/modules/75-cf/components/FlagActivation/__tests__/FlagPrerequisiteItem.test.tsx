/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { PermissionsRequest } from '@rbac/hooks/usePermission'
import { PrerequisiteItem } from '../FlagPrerequisiteItem'

jest.mock('services/cf', () => ({
  useGetAllFeatures: jest.fn().mockReturnValue({ data: [], loading: false }),
  usePatchFeature: jest.fn().mockReturnValue({ mutate: jest.fn(), loading: false })
}))

jest.mock('@cf/hooks/useEnvironmentSelectV2', () => ({
  useEnvironmentSelectV2: jest.fn().mockReturnValue({ data: [], loading: false })
}))

const mockPermission: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier } = {
  resource: { resourceType: ResourceType.FEATUREFLAG },
  permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
}

const renderComponent = (): void => {
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags/Bool_2"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <PrerequisiteItem
        prerequisite={{ feature: 'Test_Bool_1', variations: ['true'] }}
        permission={mockPermission}
        flagArchived={false}
        handlePrerequisiteInteraction={jest.fn()}
      />
    </TestWrapper>
  )
}

describe('FlagPrerequisiteItem', () => {
  test('it should render correctly', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Test_Bool_1')).toBeInTheDocument()
      expect(screen.getByTestId('prerequisiteMenuBtn')).toBeInTheDocument()
    })

    userEvent.click(screen.getByTestId('prerequisiteMenuBtn'))

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /edit/ })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /delete/ })).toBeInTheDocument()
    })
  })
})
