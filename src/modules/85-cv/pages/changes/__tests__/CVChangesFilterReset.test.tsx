/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { act, findByText, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { RiskValues } from '@cv/utils/CommonUtils'
import { mockedHealthScoreData } from '@cv/pages/monitored-service/components/ServiceHealth/__tests__/ServiceHealth.mock'
import { changeSummaryWithPositiveChange } from '@cv/pages/monitored-service/CVMonitoredService/__test__/CVMonitoredService.mock'

import { mockedSecondaryEventsResponse } from '@cv/pages/slos/__tests__/CVSLOsListingPage.mock'
import { filterPayloadWithENV, initialFilterPayload, mockData } from './data-mocks/ChangeEventListMock'
import { CVChanges } from '../CVChanges'

jest.useFakeTimers('modern')

jest.mock('@common/hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(() => true),
  useFeatureFlags: jest.fn(() => ({}))
}))

const mockHistoryPush = jest.fn()
// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => {
    const [projectIdentifier, setProjectIdentifier] = useState<string>('project1')

    useEffect(() => {
      setTimeout(() => {
        setProjectIdentifier('project2')
      }, 3000)
    }, [])

    return {
      orgIdentifier: 'orgIdentifier',
      projectIdentifier,
      accountId: 'accountId',
      identifier: 'identifier',
      module: 'cv'
    }
  },
  useHistory: jest.fn(() => ({
    push: mockHistoryPush
  }))
}))

const mockFetch = jest.fn()

beforeEach(() => {
  mockFetch.mockReset()
})
const WrapperComponent = (): React.ReactElement => {
  const updateTime = new Date(1636428309233)
  return (
    <TestWrapper
      path="/:orgIdentifier/:projectIdentifier/:accountId/:identifier"
      pathParams={{ orgIdentifier: 'org', projectIdentifier: 'project1', accountId: 'account1', identifier: 'id1' }}
    >
      <CVChanges updateTime={updateTime} />
    </TestWrapper>
  )
}

const fetchHealthScore = jest.fn()

jest.mock('highcharts-react-official', () => () => <></>)

jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => ({
  useGetHarnessServices: () => ({
    serviceOptions: [
      { label: 'service1', value: 'service1' },
      { label: 'AppDService101', value: 'AppDService101' }
    ]
  }),
  useGetHarnessEnvironments: () => {
    return {
      environmentOptions: [
        { label: 'env1', value: 'env1' },
        { label: 'AppDTestEnv1', value: 'AppDTestEnv1' }
      ]
    }
  }
}))
jest.mock('services/cv', () => ({
  useSaveMonitoredService: () =>
    jest.fn().mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: jest.fn() })),
  useUpdateMonitoredService: () =>
    jest.fn().mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: jest.fn() })),
  useGetMonitoredServiceScoresFromServiceAndEnvironment: jest.fn().mockImplementation(() => ({
    data: { currentHealthScore: { riskStatus: RiskValues.HEALTHY, healthScore: 100 } },
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetMonitoredServiceOverAllHealthScore: jest.fn().mockImplementation(() => {
    return { data: mockedHealthScoreData, refetch: fetchHealthScore, error: null, loading: false }
  }),
  useGetServiceDependencyGraph: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useGetAnomaliesSummary: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useChangeEventSummary: jest.fn().mockImplementation(() => {
    return {
      data: { resource: { ...changeSummaryWithPositiveChange } },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useChangeEventList: jest
    .fn()
    .mockImplementation(
      ({ queryParams: { serviceIdentifiers, envIdentifiers, changeSourceTypes, changeCategories } }) => {
        const contents = mockData.resource.content.filter(content => {
          let isIncluded = true
          isIncluded = changeCategories.includes(content.category) && changeSourceTypes.includes(content.type)
          if (serviceIdentifiers.length) isIncluded &&= serviceIdentifiers.includes(content.serviceIdentifier)
          if (envIdentifiers.length) isIncluded &&= envIdentifiers.includes(content.envIdentifier)
          return isIncluded
        })
        return {
          data: {
            ...mockData,
            resource: {
              ...mockData.resource,
              totalItems: contents.length,
              content: contents
            }
          },
          refetch: mockFetch,
          error: null,
          loading: false
        }
      }
    ),
  useChangeEventTimeline: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  }),
  useChangeEventTimelineForAccount: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  }),
  useChangeEventListForAccount: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  }),
  useGetMonitoredServiceChangeTimeline: jest.fn().mockImplementation(() => {
    return {
      data: {
        resource: {
          categoryTimeline: {
            Deployment: [],
            Infrastructure: [],
            Alert: []
          }
        }
      },
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  }),
  useGetSecondaryEvents: jest.fn().mockImplementation(() => {
    return {
      data: mockedSecondaryEventsResponse,
      refetch: jest.fn(),
      error: null,
      loading: false,
      cancel: jest.fn()
    }
  })
}))

describe('Unit tests for CVChanges', () => {
  test('Filters should get reset when user changes the project', async () => {
    const { container, getByTestId } = render(<WrapperComponent />)

    expect(mockFetch).toBeCalledWith(initialFilterPayload)

    mockFetch.mockClear()

    const envDropdown = getByTestId('envFilter') as HTMLInputElement

    await waitFor(() => {
      fireEvent.click(envDropdown!)
    })

    const typeToSelect = await findByText(container, 'env1')

    expect(typeToSelect).toBeInTheDocument()
    act(() => {
      fireEvent.click(typeToSelect)
    })

    const servicesDropdown1 = getByTestId('serviceFilter') as HTMLInputElement
    await waitFor(() => {
      fireEvent.click(servicesDropdown1!)
    })
    const typeToSelect2 = await findByText(container, 'AppDService101')
    expect(typeToSelect2).toBeInTheDocument()
    act(() => {
      fireEvent.click(typeToSelect2)
    })

    expect(mockFetch).toBeCalledWith(filterPayloadWithENV)

    mockFetch.mockClear()

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(mockFetch).toBeCalledWith(initialFilterPayload)
  })
})
