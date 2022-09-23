/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import * as usePermission from '@rbac/hooks/usePermission'
import RbacToggle from '../CERbacToggle'

describe('RBAC toggle', () => {
  test('should disable toggle if permission is false', () => {
    jest.spyOn(usePermission, 'usePermission').mockReturnValue([false])
    const { getByTestId } = render(
      <TestWrapper>
        <RbacToggle
          permissionRequest={{
            permissions: [PermissionIdentifier.EDIT_CCM_AUTOSTOPPING_RULE],
            resource: {
              resourceType: ResourceType.AUTOSTOPPINGRULE
            }
          }}
          data-testid={'testToggle'}
        />
      </TestWrapper>
    )
    expect(
      (getByTestId('testToggle').querySelector('input[type="checkbox"]') as HTMLInputElement).disabled
    ).toBeTruthy()
  })

  test('should fallback to disabled prop if permission is true', () => {
    jest.spyOn(usePermission, 'usePermission').mockReturnValue([true])
    const { getByTestId } = render(
      <TestWrapper>
        <RbacToggle
          permissionRequest={{
            permissions: [PermissionIdentifier.EDIT_CCM_AUTOSTOPPING_RULE],
            resource: {
              resourceType: ResourceType.AUTOSTOPPINGRULE
            }
          }}
          disabled={false}
          data-testid={'testToggle'}
        />
      </TestWrapper>
    )
    expect((getByTestId('testToggle').querySelector('input[type="checkbox"]') as HTMLInputElement).disabled).toBeFalsy()
  })
})
