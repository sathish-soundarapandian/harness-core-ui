/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { act } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { ResponseDelegateStatus, ResponseSetupStatus, useGetDelegateInstallStatus } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { useProvisionDelegateForHostedBuilds } from '../useProvisionDelegateForHostedBuilds'
import { ProvisioningStatus } from '../../pages/get-started-with-ci/InfraProvisioningWizard/Constants'

jest.mock('services/cd-ng', () => ({
  useGetDelegateInstallStatus: jest.fn().mockImplementation(() => {
    return {
      refetch: jest.fn()
    }
  }),
  useProvisionResourcesForCI: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn(() =>
        Promise.resolve({
          data: 'SUCCESS',
          status: 'SUCCESS'
        } as ResponseSetupStatus)
      )
    }
  })
}))

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateGroupByIdentifier: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return {
      data: {
        resource: {
          activelyConnected: false
        }
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

describe('Test useProvisionDelegateForHostedBuilds', () => {
  test('Should update status properly when delegate provisioning is in progress', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetDelegateInstallStatus.mockResolvedValue({
      refetch: jest.fn(() =>
        Promise.resolve({
          status: 'SUCCESS',
          data: 'IN_PROGRESS'
        } as ResponseDelegateStatus)
      )
    })

    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper pathParams={{ accountId: 'accountId' }} defaultAppStoreValues={{}}>
        <>{children}</>
      </TestWrapper>
    )
    const { result, waitForNextUpdate } = renderHook(() => useProvisionDelegateForHostedBuilds(), { wrapper })
    expect(result.current).toBeTruthy()
    await act(async () => {
      result.current.initiateProvisioning()
    })

    expect(result.current.delegateProvisioningStatus).toBe(ProvisioningStatus.TO_DO)
    await waitForNextUpdate()
    expect(result.current.delegateProvisioningStatus).toBe(ProvisioningStatus.IN_PROGRESS)
  })
})
