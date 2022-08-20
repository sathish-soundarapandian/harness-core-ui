/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Container } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { DatadogMetricsHealthSourceProps } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.type'
import DatadogMetricsHealthSource from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource'
import type { CloudMetricsHealthSourceProps } from '@cv/components/CloudMetricsHealthSource/CloudMetricsHealthSource.type'
import type { DatadogDashboardDetail } from 'services/cv'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import * as cvService from 'services/cv'
import type { GroupNameProps } from '@cv/components/GroupName/GroupName'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { mockData, MockSampleData, mockWidgetSelectedData, SourceTabsData } from './mock'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

function WrapperComponent({ data, onSubmit }: DatadogMetricsHealthSourceProps): JSX.Element {
  return (
    <TestWrapper
      path={routes.toCVActivitySourceEditSetup({
        ...accountPathProps,
        ...projectPathProps
      })}
      pathParams={{
        accountId: projectPathProps.accountId,
        projectIdentifier: projectPathProps.projectIdentifier,
        orgIdentifier: projectPathProps.orgIdentifier,
        activitySource: '1234_activitySource',
        activitySourceId: '1234_sourceId'
      }}
    >
      <SetupSourceTabs data={data} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <DatadogMetricsHealthSource data={data} onSubmit={onSubmit} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

jest.mock(
  '@cv/components/CloudMetricsHealthSource/CloudMetricsHealthSource',
  () => (props: CloudMetricsHealthSourceProps<DatadogDashboardDetail>) => {
    return (
      <>
        <Container>{props.metricDetailsContent}</Container>
        <Container
          className="selectMetricContainer"
          onClick={() => props.onWidgetMetricSelected(mockWidgetSelectedData)}
        />
        <Container
          className="timeseriesDataContainer"
          onClick={() => props.onFetchTimeseriesData(mockWidgetSelectedData.query)}
        />
        <Container>{props.selectedMetricInfo?.query}</Container>
        <Container>{props.timeseriesDataError}</Container>
      </>
    )
  }
)

jest.mock('@cv/components/GroupName/GroupName', () => (props: GroupNameProps) => {
  return (
    <Container>
      <span>{props.item?.value}</span>
    </Container>
  )
})

describe('DatadogMetricsHealthSource unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(cvService, 'useGetDatadogActiveMetrics').mockReturnValue({
      data: { data: ['active_metric_1', 'active_metric_2', 'active_metric_3'] },
      refetch: jest.fn() as unknown
    } as any)
    jest.spyOn(cvService, 'useGetDatadogMetricTags').mockReturnValue({
      data: {
        data: {
          tagKeys: ['metric_tag_1', 'metric_tag_2', 'metric_tag_3'],
          metricTags: ['metric_tag_1:test', 'metric_tag_2:test', 'metric_tag_3:test']
        }
      },
      refetch: jest.fn() as unknown
    } as any)
  })

  test('It should fetch timeseries data when onFetchTimeseriesData is called', async () => {
    const datadogSampleDataRefetchMock = jest.fn()
    datadogSampleDataRefetchMock.mockReturnValue(MockSampleData)
    jest.spyOn(cvService, 'useGetDatadogSampleData').mockReturnValue({
      data: [],
      refetch: datadogSampleDataRefetchMock
    } as any)
    const { container } = render(<WrapperComponent data={SourceTabsData} onSubmit={jest.fn()} />)

    const selectMetricContainerMock = container.querySelector('.selectMetricContainer')

    if (!selectMetricContainerMock) {
      throw Error('Mock container is not rendered.')
    }
    fireEvent.click(selectMetricContainerMock)

    const timeseriesDataContainerMock = container.querySelector('.timeseriesDataContainer')
    if (!timeseriesDataContainerMock) {
      throw Error('Mock container is not rendered.')
    }
    fireEvent.click(timeseriesDataContainerMock)

    expect(datadogSampleDataRefetchMock).toHaveBeenCalledTimes(1)

    // validate that request is called with query value from selected metric
    expect(datadogSampleDataRefetchMock).toHaveBeenNthCalledWith(1, {
      queryParams: {
        orgIdentifier: projectPathProps.orgIdentifier,
        projectIdentifier: projectPathProps.projectIdentifier,
        accountId: projectPathProps.accountId,
        connectorIdentifier: undefined,
        tracingId: expect.any(String),
        query: mockWidgetSelectedData?.query
      }
    })
  })

  test('It should fill inputs with selected metric data when metric onWidgetMetricSelected is called', async () => {
    const { container, getByText } = render(<WrapperComponent data={SourceTabsData} onSubmit={jest.fn()} />)
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const selectMetricContainerMock = container.querySelector('.selectMetricContainer')
    if (!selectMetricContainerMock) {
      throw Error('Mock container is not rendered.')
    }

    fireEvent.click(selectMetricContainerMock)
    await waitFor(() =>
      expect(container.querySelector(`input[value="${mockWidgetSelectedData.metricName}"]`)).not.toBeNull()
    )
    if (!mockWidgetSelectedData.dashboardTitle) {
      throw Error('Mock widget name should be provided.')
    }
    expect(getByText(mockWidgetSelectedData.dashboardTitle)).not.toBeNull()
  })

  test('It should generate error message and pass to child component when timeseries data request fails', async () => {
    jest.spyOn(cvService, 'useGetDatadogSampleData').mockReturnValue({
      data: [],
      refetch: jest.fn(),
      error: {
        message: 'Mock error message',
        data: null,
        status: 400
      }
    } as any)
    const { getByText } = render(<WrapperComponent data={SourceTabsData} onSubmit={jest.fn()} />)

    await waitFor(() => expect(getByText('Mock error message')).not.toBeNull())
  })

  describe('Metric thresholds', () => {
    test('should render metric thresholds', () => {
      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)
      render(<WrapperComponent data={mockData} onSubmit={jest.fn()} />)

      expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (1)')).toBeInTheDocument()
      expect(screen.getByText('cv.monitoringSources.appD.failFastThresholds (1)')).toBeInTheDocument()
      const addButton = screen.getByTestId('AddThresholdButton')

      expect(addButton).toBeInTheDocument()

      fireEvent.click(addButton)

      expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (2)')).toBeInTheDocument()
    })

    test('should not render metric thresholds when feature flag is turned off', () => {
      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(false)
      render(<WrapperComponent data={SourceTabsData} onSubmit={jest.fn()} />)

      expect(screen.queryByText('cv.monitoringSources.appD.ignoreThresholds (0)')).not.toBeInTheDocument()
      expect(screen.queryByText('cv.monitoringSources.appD.failFastThresholds (0)')).not.toBeInTheDocument()
    })

    test('should not render metric thresholds there is not custom metric', () => {
      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)
      render(<WrapperComponent data={SourceTabsData} onSubmit={jest.fn()} />)

      expect(screen.queryByText('cv.monitoringSources.appD.ignoreThresholds (0)')).not.toBeInTheDocument()
      expect(screen.queryByText('cv.monitoringSources.appD.failFastThresholds (0)')).not.toBeInTheDocument()
    })
  })
})
