/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { String } from 'framework/strings'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { defaultError, orgRbacError, pipelineRbacError, projectRbacError } from './useRBACErrorMock'
import useRBACError from '../useRBACError'

jest.mock('@rbac/factories/RbacFactory', () => ({
  getResourceTypeHandler: jest.fn().mockImplementation(_resource => ({
    icon: 'pipeline-deployment',
    label: 'pipelines',
    permissionLabels: {
      [PermissionIdentifier.VIEW_PIPELINE]: <String stringID="rbac.permissionLabels.view" />,
      [PermissionIdentifier.EDIT_PIPELINE]: <String stringID="rbac.permissionLabels.createEdit" />,
      [PermissionIdentifier.DELETE_PIPELINE]: <String stringID="rbac.permissionLabels.delete" />,
      [PermissionIdentifier.EXECUTE_PIPELINE]: <String stringID="rbac.permissionLabels.execute" />
    }
  }))
}))
describe('useRbacError', () => {
  test.each([pipelineRbacError, orgRbacError, projectRbacError])('testRBACError rbac errors', err => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toPipelineStudio({
          ...projectPathProps,
          ...pipelinePathProps,
          ...modulePathProps
        })}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: '-1',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        {children}
      </TestWrapper>
    )
    const { result } = renderHook(() => useRBACError(), { wrapper })
    const error = result.current.getRBACErrorMessage(err)
    expect(error).toMatchSnapshot()
  })
  test('testRBACError without rbac errors', () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper
        path={routes.toPipelineStudio({
          ...projectPathProps,
          ...pipelinePathProps,
          ...modulePathProps
        })}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: '-1',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        {children}
      </TestWrapper>
    )
    const { result } = renderHook(() => useRBACError(), { wrapper })
    const error = result.current.getRBACErrorMessage(defaultError)
    expect(error).toBe('Invalid Request')
  })
})
