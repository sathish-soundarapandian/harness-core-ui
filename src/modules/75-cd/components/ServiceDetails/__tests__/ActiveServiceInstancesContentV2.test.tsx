/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, fireEvent } from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import * as cdngServices from 'services/cd-ng'
import { ActiveServiceInstancesV2 } from '../ActiveServiceInstances/ActiveServiceInstancesV2'

jest.mock('highcharts-react-official', () => () => <></>)

const mockData = {
  status: 'SUCCESS',
  metaData: undefined,
  correlationId: 'b63629d2-66e4-4bac-baf6-a59bcc67a935',
  data: {
    instanceGroupedByArtifactList: [
      {
        artifactVersion: 'artifact-1',
        instanceGroupedByEnvironmentList: [
          {
            envId: 'env-1',
            envName: 'env-1',
            instanceGroupedByInfraList: [
              {
                infraIdentifier: 'infra-1',
                infraName: 'infra-1',
                count: 12,
                lastPipelineExecutionId: 'IRr8j_YKQHiLb8RrgGcgTQ1',
                lastPipelineExecutionName: 'Pipeline-1',
                lastDeployedAt: '1656913346474'
              },
              {
                infraIdentifier: 'infra-2',
                infraName: 'infra-2',
                count: 2,
                lastPipelineExecutionId: 'IRr8j_YKQHiLb8RrgGcgTQ2',
                lastPipelineExecutionName: 'Pipeline-2',
                lastDeployedAt: '1156913346474'
              }
            ]
          },
          {
            envId: 'env-2',
            envName: 'env-2',
            instanceGroupedByInfraList: [
              {
                infraIdentifier: 'infra-3',
                infraName: 'infra-3',
                count: 1,
                lastPipelineExecutionId: 'IRr8j_YKQHiLb8RrgGcgTQ3',
                lastPipelineExecutionName: 'Pipeline-3',
                lastDeployedAt: '1556913346474'
              },
              {
                infraIdentifier: 'infra-4',
                infraName: 'infra-4',
                count: 2,
                lastPipelineExecutionId: 'IRr8j_YKQHiLb8RrgGcgTQ4',
                lastPipelineExecutionName: 'Pipeline-4',
                lastDeployedAt: '1256913346474'
              }
            ]
          }
        ]
      },
      {
        artifactVersion: 'artifact-2',
        instanceGroupedByEnvironmentList: [
          {
            envId: 'env-3',
            envName: 'env-3',
            instanceGroupedByInfraList: [
              {
                infraIdentifier: 'infra-5',
                infraName: 'infra-5',
                count: 1,
                lastPipelineExecutionId: 'IRr8j_YKQHiLb8RrgGcgTQ5',
                lastPipelineExecutionName: 'Pipeline-5',
                lastDeployedAt: '1456913346474'
              },
              {
                infraIdentifier: 'infra-6',
                infraName: 'infra-6',
                count: 2,
                lastPipelineExecutionId: 'IRr8j_YKQHiLb8RrgGcgTQ6',
                lastPipelineExecutionName: 'Pipeline-6',
                lastDeployedAt: '1356913346474'
              }
            ]
          },
          {
            envId: 'env-4',
            envName: 'env-4',
            instanceGroupedByInfraList: [
              {
                infraIdentifier: 'infra-7',
                infraName: 'infra-7',
                count: 1,
                lastPipelineExecutionId: 'IRr8j_YKQHiLb8RrgGcgTQ7',
                lastPipelineExecutionName: 'Pipeline-7',
                lastDeployedAt: '1756913346474'
              },
              {
                infraIdentifier: 'infra-8',
                infraName: 'infra-8',
                count: 2,
                lastPipelineExecutionId: 'IRr8j_YKQHiLb8RrgGcgTQ8',
                lastPipelineExecutionName: 'Pipeline-8',
                lastDeployedAt: '1856913346474'
              }
            ]
          }
        ]
      }
    ]
  }
}
const noData = {
  status: 'SUCCESS',
  data: {}
}
jest.spyOn(cdngServices, 'useGetActiveServiceInstanceSummary').mockImplementation(() => {
  return {
    loading: false,
    error: false,
    data: {},
    refetch: jest.fn()
  } as any
})
jest.spyOn(cdngServices, 'useGetInstanceGrowthTrend').mockImplementation(() => {
  return {
    loading: false,
    error: false,
    data: {},
    refetch: jest.fn()
  } as any
})
describe('ActiveServiceInstancesContent', () => {
  jest.spyOn(cdngServices, 'useGetEnvArtifactDetailsByServiceId').mockImplementation(() => {
    return {
      mutate: () => Promise.resolve({ loading: false, data: [] })
    } as any
  })
  test('should render ActiveServiceInstancesContent', () => {
    jest.spyOn(cdngServices, 'useGetActiveServiceInstances').mockImplementation(() => {
      return { loading: false, error: false, data: mockData, refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper>
        <ActiveServiceInstancesV2 />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('should render error', () => {
    jest.spyOn(cdngServices, 'useGetActiveServiceInstances').mockImplementation(() => {
      return { loading: false, error: true, data: noData, refetch: jest.fn() } as any
    })
    const { container, getByText } = render(
      <TestWrapper>
        <ActiveServiceInstancesV2 />
      </TestWrapper>
    )
    expect(getByText('Retry')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('should render loading', () => {
    jest.spyOn(cdngServices, 'useGetActiveServiceInstances').mockImplementation(() => {
      return { loading: true, error: false, data: noData, refetch: jest.fn() } as any
    })
    const { container } = render(
      <TestWrapper>
        <ActiveServiceInstancesV2 />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render no data', () => {
    jest.spyOn(cdngServices, 'useGetActiveServiceInstances').mockImplementation(() => {
      return {
        loading: false,
        error: false,
        data: noData,
        refetch: jest.fn()
      } as any
    })
    const { container } = render(
      <TestWrapper>
        <ActiveServiceInstancesV2 />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

describe('ActiveInstance Details Dialog', () => {
  test('Open details dialog', async () => {
    jest.spyOn(cdngServices, 'useGetActiveServiceInstances').mockImplementation(() => {
      return { loading: false, error: false, data: mockData, refetch: jest.fn() } as any
    })
    const { getByText } = render(
      <TestWrapper>
        <ActiveServiceInstancesV2 />
      </TestWrapper>
    )

    const moreDetailsButton = getByText('cd.serviceDashboard.moreDetails')
    await act(async () => {
      fireEvent.click(moreDetailsButton!)
    })

    const popup = findDialogContainer()
    expect(popup).toBeTruthy()
    expect(popup).toMatchSnapshot()
  })

  test('Expand all sections in dialog', async () => {
    jest.spyOn(cdngServices, 'useGetActiveServiceInstances').mockImplementation(() => {
      return { loading: false, error: false, data: mockData, refetch: jest.fn() } as any
    })
    const { getByText } = render(
      <TestWrapper>
        <ActiveServiceInstancesV2 />
      </TestWrapper>
    )

    const moreDetailsButton = getByText('cd.serviceDashboard.moreDetails')
    await act(async () => {
      fireEvent.click(moreDetailsButton!)
    })

    const popup = findDialogContainer()
    expect(popup).toBeTruthy()

    const expandButtons = document.querySelectorAll('.bp3-icon')
    await act(async () => {
      expandButtons.forEach(expandButton => {
        fireEvent.click(expandButton)
      })
    })

    expect(popup).toMatchSnapshot()
  })
})
