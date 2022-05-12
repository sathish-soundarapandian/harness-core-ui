/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, waitFor, screen, fireEvent, act } from '@testing-library/react'
import * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import LogAnalysis from '@cv/components/LogsAnalysis/LogAnalysis'
import {
  mockedClustersData,
  mockedHealthSourcesData
} from '@cv/pages/monitored-service/components/ServiceHealth/components/MetricsAndLogs/__tests__/MetricsAndLogs.mock'
import { LogAnalysisProps, LogEvents } from '../LogAnalysis.types'
import { mockedLogAnalysisData } from './LogAnalysis.mocks'
import { mockLogsCall } from '../components/LogAnalysisRow/__tests__/LogAnalysisRow.mocks'

const WrapperComponent = (props: LogAnalysisProps): JSX.Element => {
  return (
    <TestWrapper>
      <LogAnalysis {...props} />
    </TestWrapper>
  )
}

jest.spyOn(cvServices, 'useGetVerifyStepDeploymentLogAnalysisRadarChartResult').mockReturnValue({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  data: mockLogsCall
})

jest.mock('highcharts-react-official', () => () => <></>)
const fetchLogAnalysis = jest.fn()
const fetchClusterData = jest.fn()
let useGetAllLogsClusterDataQueryParams: cvServices.GetAllLogsClusterDataQueryParams | undefined
let useGetAllLogsDataQueryParams: cvServices.GetAllLogsDataQueryParams | undefined

jest.mock('services/cv', () => ({
  useGetAllLogsData: jest.fn().mockImplementation(props => {
    useGetAllLogsDataQueryParams = props.queryParams
    return { data: mockedLogAnalysisData, loading: false, error: null, refetch: fetchLogAnalysis }
  }),
  useGetAllHealthSourcesForMonitoredServiceIdentifier: jest.fn().mockImplementation(() => {
    return { data: mockedHealthSourcesData, error: null, loading: false }
  }),
  useGetAllLogsClusterData: jest.fn().mockImplementation(props => {
    useGetAllLogsClusterDataQueryParams = props.queryParams
    return { data: mockedClustersData, error: null, loading: false, refetch: fetchClusterData }
  }),
  useGetVerifyStepDeploymentLogAnalysisRadarChartResult: jest.fn().mockImplementation(() => {
    return {
      data: mockLogsCall
    }
  })
}))

describe('Unit tests for LogAnalysisContainer', () => {
  const props = {
    monitoredServiceIdentifier: 'monitored_service_identifier',
    serviceIdentifier: 'service-identifier',
    environmentIdentifier: 'env-identifier',
    startTime: 1630594988077,
    endTime: 1630595011443
  }
  test('Verify if LogAnalysisContainer renders', async () => {
    const { container } = render(<WrapperComponent {...props} />)
    expect(container).toMatchSnapshot()
  })

  test('Verify if Logs Cluster Chart and Logs Record Table is rendered correctly', async () => {
    render(<WrapperComponent {...props} />)

    // Verify if number of records returned by the api for the first page matches with the number of records shown in the Logs Table
    await waitFor(() =>
      expect(screen.getAllByTestId('logs-data-row')).toHaveLength(mockedLogAnalysisData.resource.content.length)
    )
  })

  test('Verify if Filtering by cluster type works correctly', async () => {
    const { container, getByText, getAllByText } = render(<WrapperComponent {...props} />)

    const clusterTypeFilterDropdown = container.querySelector(
      'input[placeholder="pipeline.verification.logs.filterByClusterType"]'
    ) as HTMLInputElement

    expect(clusterTypeFilterDropdown).toBeTruthy()

    // verify default filter is unknownEvent
    expect(clusterTypeFilterDropdown.value).toBe('cv.unknown')

    // Clicking the filter dropdown
    const selectCaret = container
      .querySelector(`[placeholder="pipeline.verification.logs.filterByClusterType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(selectCaret!)
    })

    // Selecting Known event cluster type
    const typeToSelect = await getByText('cv.known')
    act(() => {
      fireEvent.click(typeToSelect)
    })
    expect(clusterTypeFilterDropdown.value).toBe('cv.known')

    // Verifying if correct number of records are shown for Known event type.
    const knownClusterTypeMockedData = mockedLogAnalysisData.resource.content.filter(el => el.logData.tag === 'KNOWN')
    await waitFor(() => expect(getAllByText('Known')).toHaveLength(knownClusterTypeMockedData.length))

    // Selecting UnKnown event cluster type
    const unknownEventTypeSelected = await getByText('cv.unknown')
    act(() => {
      fireEvent.click(unknownEventTypeSelected)
    })
    expect(clusterTypeFilterDropdown.value).toBe('cv.unknown')

    // Verifying if correct number of records are shown for unKnown event type.
    const unknownClusterTypeMockedData = mockedLogAnalysisData.resource.content.filter(
      el => el.logData.tag === 'UNKNOWN'
    )
    await waitFor(() => expect(getAllByText('Unknown')).toHaveLength(unknownClusterTypeMockedData.length))
  })

  test('it should not pass field clusterTypes to BE for event type All', () => {
    render(<WrapperComponent {...props} />)

    const clusterTypeFilterDropdown = screen.getByPlaceholderText(
      'pipeline.verification.logs.filterByClusterType'
    ) as HTMLInputElement

    expect(clusterTypeFilterDropdown.value).toBe('cv.unknown')
    expect(useGetAllLogsClusterDataQueryParams?.clusterTypes).toEqual([LogEvents.UNKNOWN])
    expect(useGetAllLogsDataQueryParams?.clusterTypes).toEqual([LogEvents.UNKNOWN])

    userEvent.click(clusterTypeFilterDropdown)
    userEvent.click(screen.getByText('auditTrail.allEvents'))

    expect(clusterTypeFilterDropdown.value).toBe('auditTrail.allEvents')
    expect(useGetAllLogsClusterDataQueryParams).not.toHaveProperty('clusterTypes')
    expect(useGetAllLogsDataQueryParams).not.toHaveProperty('clusterTypes')
  })
})
