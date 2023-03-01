/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ActiveServiceInstancesHeader } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancesHeader'
import * as cdngServices from 'services/cd-ng'

jest.mock('highcharts-react-official', () => () => <></>)

jest.spyOn(cdngServices, 'useGetActiveServiceInstanceSummaryV2').mockImplementation(() => {
  return {
    loading: false,
    error: false,
    data: {
      data: {
        changeRate: {
          trend: 'UP_TREND',
          percentChange: 5
        },
        countDetails: {
          nonProdInstances: 2,
          prodInstances: 1,
          totalInstances: 3
        }
      }
    },
    refetch: jest.fn()
  } as any
})
jest.spyOn(cdngServices, 'useGetInstanceGrowthTrend').mockImplementation(() => {
  return {
    loading: false,
    error: false,
    data: {
      data: {
        timeValuePairList: [
          {
            timestamp: 10,
            value: 15
          },
          {
            timestamp: 4,
            value: 5
          },
          {
            timestamp: 5,
            value: 6
          }
        ]
      }
    },
    refetch: jest.fn()
  } as any
})
describe('ActiveServiceInstancesHeader', () => {
  test('should render ActiveServiceInstancesHeader', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ActiveServiceInstancesHeader />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render INVALID_CHANGE_RATE', () => {
    jest.spyOn(cdngServices, 'useGetActiveServiceInstanceSummary').mockImplementation(() => {
      return {
        loading: false,
        error: false,
        data: {
          data: {
            changeRate: -10000,
            countDetails: {
              nonProdInstances: 0,
              prodInstances: 0,
              totalInstances: 0
            }
          }
        },
        refetch: jest.fn()
      } as any
    })
    const { container } = render(
      <TestWrapper>
        <ActiveServiceInstancesHeader />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render no data', () => {
    jest.spyOn(cdngServices, 'useGetInstanceGrowthTrend').mockImplementation(() => {
      return { loading: false, error: false, data: [], refetch: jest.fn() } as any
    })
    jest.spyOn(cdngServices, 'useGetActiveServiceInstanceSummary').mockImplementation(() => {
      return { loading: false, error: false, data: [], refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper>
        <ActiveServiceInstancesHeader />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render error', () => {
    jest.spyOn(cdngServices, 'useGetActiveServiceInstanceSummary').mockImplementation(() => {
      return { loading: false, error: true, data: [], refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper>
        <ActiveServiceInstancesHeader />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
