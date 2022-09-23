/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { cloneDeep } from 'lodash-es'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { testWrapperProps } from '@cv/pages/monitored-service/CVMonitoredService/__test__/CVMonitoredService.test'
import type { MetricDashboardWidgetNavProps } from '@cv/components/MetricDashboardWidgetNav/MetricDashboardWidgetNav.type'
import type { StringKeys } from 'framework/strings'
import type { MetricsValidationChartProps } from '@cv/components/CloudMetricsHealthSource/components/validationChart/MetricsValidationChart'
import type { ExtendedMonacoEditorProps } from '@common/components/MonacoEditor/MonacoEditor'
import {
  DefaultSourceData,
  mockCloudMetricHealthSourceProps,
  mockQueryValue,
  mockUseGetReturnData
} from '@cv/components/CloudMetricsHealthSource/tests/mock'
import type { SelectHealthSourceServicesProps } from '@cv/pages/health-source/common/SelectHealthSourceServices/SelectHealthSourceServices.types'
import * as cvService from 'services/cv'
import CloudMetricsHealthSource from '../CloudMetricsHealthSource'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

const mockMetricDashboardWidgetNav = jest.fn()
jest.mock(
  '@cv/components/MetricDashboardWidgetNav/MetricDashboardWidgetNav.tsx',
  () => (props: MetricDashboardWidgetNavProps<any>) => {
    mockMetricDashboardWidgetNav(props)
    return <></>
  }
)

const mockMetricsValidationChart = jest.fn()
jest.mock(
  '@cv/components/CloudMetricsHealthSource/components/validationChart/MetricsValidationChart.tsx',
  () => (props: MetricsValidationChartProps) => {
    mockMetricsValidationChart(props)
    // we should mock onRetry call, so we can validate CloudMetricsHealthSource component reacts on it
    useEffect(() => {
      props.onRetry()
    }, [])
    return <></>
  }
)

const mockSelectHealthSourceServices = jest.fn()
jest.mock(
  '@cv/pages/health-source/common/SelectHealthSourceServices/SelectHealthSourceServices.tsx',
  () => (props: SelectHealthSourceServicesProps) => {
    mockSelectHealthSourceServices(props)
    return <></>
  }
)
const mockMonacoEditor = jest.fn()
jest.mock('@common/components/MonacoEditor/MonacoEditor.tsx', () => (props: ExtendedMonacoEditorProps) => {
  mockMonacoEditor(props)
  return <></>
})

function WrapperComponent(content: React.ReactElement): JSX.Element {
  return (
    <TestWrapper {...testWrapperProps}>
      <SetupSourceTabs data={cloneDeep(DefaultSourceData)} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        {content}
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('Unit tests for CloudMetricsHealthSource', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(cvService, 'useGetMetricPacks').mockReturnValue(mockUseGetReturnData as any)
  })

  test('Ensure props are passed properly to child component', async () => {
    const mockAddQueryTitle: StringKeys = 'cv.monitoringSources.datadog.manualInputQueryModal.modalTitle'

    const mockCloudMetricHealthSourcePropsValue = { ...mockCloudMetricHealthSourceProps(<></>) }
    render(WrapperComponent(<CloudMetricsHealthSource {...mockCloudMetricHealthSourcePropsValue} />))
    expect(mockMetricDashboardWidgetNav).toHaveBeenNthCalledWith(1, {
      connectorIdentifier: DefaultSourceData.identifier,
      addManualQueryTitle: mockAddQueryTitle,
      dashboardDetailsRequest: expect.any(Object),
      dashboardWidgetMapper: expect.any(Function),
      dashboards: [],
      manuallyInputQueries: [],
      onSelectMetric: expect.any(Function),
      showSpinnerOnLoad: expect.any(Boolean)
    })
    expect(mockMetricsValidationChart).toHaveBeenNthCalledWith(1, {
      error: undefined,
      isQueryExecuted: false,
      loading: true,
      onRetry: expect.any(Function),
      queryValue: mockQueryValue,
      sampleData: {},
      submitQueryText: 'cv.monitoringSources.datadogLogs.submitQueryToSeeRecords'
    })
    expect(mockSelectHealthSourceServices).toHaveBeenNthCalledWith(1, {
      values: {
        sli: mockCloudMetricHealthSourcePropsValue.formikProps.values.sli,
        healthScore: mockCloudMetricHealthSourcePropsValue.formikProps.values.healthScore,
        continuousVerification: mockCloudMetricHealthSourcePropsValue.formikProps.values.continuousVerification,
        serviceInstance: mockCloudMetricHealthSourcePropsValue.formikProps.values.serviceInstance
      },
      metricPackResponse: mockUseGetReturnData,
      labelNamesResponse: { data: { data: ['cluster-name'] } }
    })
    expect(mockMonacoEditor).toHaveBeenCalledTimes(0)
  })

  test('Should pass error to ValidationChart when retrieving timeseries data request fails', async () => {
    const mockErrorMessage = 'Mock error message'

    const propsWithMockError = {
      ...mockCloudMetricHealthSourceProps(<></>),
      timeseriesDataError: mockErrorMessage
    }
    render(WrapperComponent(<CloudMetricsHealthSource {...propsWithMockError} />))
    expect(mockMetricsValidationChart).toHaveBeenNthCalledWith(1, {
      error: mockErrorMessage,
      isQueryExecuted: expect.any(Boolean),
      loading: expect.any(Boolean),
      onRetry: expect.any(Function),
      queryValue: expect.any(String),
      sampleData: expect.any(Object),
      submitQueryText: 'cv.monitoringSources.datadogLogs.submitQueryToSeeRecords'
    })
  })

  test('Should call onFetchTimeseriesData when retry button is clicked and query exists', async () => {
    const mockOnFetchTimeseriesData = jest.fn()
    render(
      WrapperComponent(
        <CloudMetricsHealthSource
          {...mockCloudMetricHealthSourceProps(<></>)}
          selectedMetricInfo={{ query: 'test_query' }}
          onFetchTimeseriesData={mockOnFetchTimeseriesData}
        />
      )
    )
    expect(mockOnFetchTimeseriesData).toHaveBeenCalledTimes(1)
  })
  test("Should not call onFetchTimeseriesData when retry button is clicked and query doesn't exist", async () => {
    const mockOnFetchTimeseriesData = jest.fn()
    const mockProps = mockCloudMetricHealthSourceProps(<></>)
    const mockPropsWithNoQuery = {
      ...mockProps,
      formikProps: {
        ...mockProps.formikProps,
        values: {
          sli: true,
          healthScore: false,
          continuousVerification: false,
          ignoreThresholds: [],
          failFastThresholds: []
        }
      }
    }
    render(
      WrapperComponent(
        <CloudMetricsHealthSource
          {...mockPropsWithNoQuery}
          selectedMetricInfo={{ query: undefined }}
          onFetchTimeseriesData={mockOnFetchTimeseriesData}
        />
      )
    )
    expect(mockOnFetchTimeseriesData).toHaveBeenCalledTimes(0)
  })
})
