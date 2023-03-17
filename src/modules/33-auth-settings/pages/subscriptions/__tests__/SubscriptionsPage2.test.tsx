/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  useGetAccountNG,
  useGetModuleLicensesByAccountAndModuleType,
  useExtendTrialLicense,
  useSaveFeedback,
  getOrganizationListPromise,
  getProjectListPromise,
  getAllServicesPromise,
  useDownloadActiveServiceCSVReport
} from 'services/cd-ng'
import { Editions } from '@common/constants/SubscriptionTypes'
import SubscriptionsPage from '../SubscriptionsPage'
import orgMockData from './mocks/orgMockData.json'
import projMockData from './mocks/projMockData.json'
import serviceMockData from './mocks/serviceMockData.json'
jest.mock('services/cd-ng')
const getOrganizationListPromiseMock = getOrganizationListPromise as jest.MockedFunction<any>
const getProjectListPromiseMock = getProjectListPromise as jest.MockedFunction<any>
const getServiceListPromiseMock = getAllServicesPromise as jest.MockedFunction<any>
const useGetModuleLicenseInfoMock = useGetModuleLicensesByAccountAndModuleType as jest.MockedFunction<any>
const useDownloadActiveServiceCSVReportMock = useDownloadActiveServiceCSVReport as jest.MockedFunction<any>
const useGetAccountMock = useGetAccountNG as jest.MockedFunction<any>
const useExtendTrialLicenseMock = useExtendTrialLicense as jest.MockedFunction<any>

jest.mock('highcharts-react-official', () => () => <div />)
const orgListPromiseMock = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    orgMockData
  })
})
const projListPromiseMock = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    projMockData
  })
})
const serviceListPromiseMock = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    serviceMockData
  })
})

useExtendTrialLicenseMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})
getOrganizationListPromiseMock.mockImplementation(() => {
  return orgListPromiseMock()
})
getProjectListPromiseMock.mockImplementation(() => {
  return projListPromiseMock()
})
getServiceListPromiseMock.mockImplementation(() => {
  return serviceListPromiseMock()
})
const useSaveFeedbackMock = useSaveFeedback as jest.MockedFunction<any>
useSaveFeedbackMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))
moment.now = jest.fn(() => 1482363367071)

const featureFlags = {
  CVNG_ENABLED: true,
  CING_ENABLED: true,
  CENG_ENABLED: true,
  CFNG_ENABLED: true,
  CHAOS_ENABLED: true
}

describe('Subscriptions Page', () => {
  useDownloadActiveServiceCSVReportMock.mockImplementation(() => {
    return {
      data: '',
      refetch: jest.fn()
    }
  })
  test('it renders the subscriptions page with no data service table', async () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [
            {
              edition: Editions.ENTERPRISE,
              cdLicenseType: 'SERVICES'
            }
          ],
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    useGetAccountMock.mockImplementation(() => {
      return {
        data: {
          data: {
            accountId: '123'
          },
          status: 'SUCCESS'
        },
        refetch: jest.fn()
      }
    })

    const { container, getByText } = render(
      <TestWrapper
        defaultAppStoreValues={{ featureFlags }}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CD: { edition: 'FREE', status: 'ACTIVE' }
          }
        }}
      >
        <SubscriptionsPage />
      </TestWrapper>
    )
    expect(getByText('common.subscriptions.title')).toBeTruthy()
    expect(getByText('common.subscriptions.expiryCountdown')).toBeTruthy()
    expect(getByText('common.subscriptions.trial')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
})
