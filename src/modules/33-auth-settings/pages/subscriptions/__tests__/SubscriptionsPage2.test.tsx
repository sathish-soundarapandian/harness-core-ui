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
  useDownloadActiveServiceCSVReport,
  useGetCreditsByAccount
} from 'services/cd-ng'
import { listActiveDevelopersPromise } from 'services/ci'
import { Editions } from '@common/constants/SubscriptionTypes'
import { ModuleName } from 'framework/types/ModuleName'
import SubscriptionsPage from '../SubscriptionsPage'
import orgMockData from './mocks/orgMockData.json'
import projMockData from './mocks/projMockData.json'
import serviceMockData from './mocks/serviceMockData.json'

jest.mock('services/cd-ng')
jest.mock('services/ci')
const getOrganizationListPromiseMock = getOrganizationListPromise as jest.MockedFunction<any>
const useGetCreditsByAccountMock = useGetCreditsByAccount as jest.MockedFunction<any>
const getListActiveDevelopersPromiseMock = listActiveDevelopersPromise as jest.MockedFunction<any>
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
const devListPromiseMock = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    data: ['abc', 'def']
  })
})
const serviceListPromiseMock = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    serviceMockData
  })
})
useGetCreditsByAccountMock.mockImplementation(() => {
  return []
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
getListActiveDevelopersPromiseMock.mockImplementation(() => {
  return devListPromiseMock()
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
  BUILD_CREDITS_VIEW: true,
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
  jest.useFakeTimers('modern')
  jest.setSystemTime(new Date('2020-01-19'))
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
  test('should render CI details  with no data service table', () => {
    useGetModuleLicenseInfoMock.mockImplementation(() => {
      return {
        data: {
          data: [
            {
              edition: Editions.ENTERPRISE,
              numberOfCommitters: 200,
              moduleType: 'CI'
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

    const { container } = render(
      <TestWrapper
        defaultAppStoreValues={{ featureFlags }}
        pathParams={{ module: ModuleName.CI }}
        queryParams={{ moduleCard: ModuleName.CI }}
      >
        <SubscriptionsPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot('ci module ')
    // document.querySelector('[data-icon="ci-with-dark-text"]').click()
  })
})
