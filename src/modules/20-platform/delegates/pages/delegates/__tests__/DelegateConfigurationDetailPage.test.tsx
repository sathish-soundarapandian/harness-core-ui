/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateProfileDetails from '../DelegateConfigurationDetailPage'
import ProfileMock from './ProfileMock.json'

const mockGetCallFunction = jest.fn()
jest.mock('services/cd-ng', () => ({
  useGetDelegateConfigNgV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: ProfileMock, refetch: jest.fn(), error: null, loading: false }
  }),
  useUpdateDelegateConfigNgV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetEnvironmentListForProject: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))
jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showError: jest.fn(),
    showSuccess: jest.fn()
  })
}))
describe('Delegates Profile Detail', () => {
  test('initial render', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/resources/delegateconfigs/:delegateConfigIdentifier/"
        pathParams={{ accountId: 'dummy', delegateConfigIdentifier: 'delegateConfigIdentifier' }}
      >
        <DelegateProfileDetails />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
  test('start edit mode', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/resources/delegateconfigs/:delegateConfigIdentifier/"
        pathParams={{ accountId: 'dummy', delegateConfigIdentifier: 'delegateConfigIdentifier' }}
      >
        <DelegateProfileDetails />
      </TestWrapper>
    )

    const buttons = container.getElementsByTagName('button')
    const editBtn = buttons[0]

    act(() => {
      fireEvent.click(editBtn)
    })

    expect(container).toMatchSnapshot()
  })
})
