/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { act } from 'react-test-renderer'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DynatraceMockHealthSourceData } from '@cv/pages/health-source/connectors/Dynatrace/__tests__/DynatraceHealthSource.mock'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import DynatraceCustomMetrics from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics'
import type { DynatraceCustomMetricsProps } from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics.types'
import { DYNATRACE_CUSTOM_METRICS_PROPS_MOCK } from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/__tests__/DynatraceCustomMetrics.mock'
import * as cvService from 'services/cv'
import type { QueryContentProps } from '@cv/components/QueryViewer/types'
import type { SelectHealthSourceServicesProps } from '@cv/pages/health-source/common/SelectHealthSourceServices/SelectHealthSourceServices.types'
import type { MetricsValidationChartProps } from '@cv/components/CloudMetricsHealthSource/components/validationChart/MetricsValidationChart'
import type { NameIdProps } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

const healthSourceServicesRenderMock = jest.fn()
jest.mock(
  '@cv/pages/health-source/common/SelectHealthSourceServices/SelectHealthSourceServices',
  () => (props: SelectHealthSourceServicesProps) => {
    useEffect(() => {
      healthSourceServicesRenderMock(props.metricPackResponse)
    }, [])
    return <></>
  }
)
const nameIdRenderMock = jest.fn()
const isIdentifierEditableMock = jest.fn()
jest.mock('@common/components/NameIdDescriptionTags/NameIdDescriptionTags', () => ({
  __esModule: true,
  NameId: (props: NameIdProps) => {
    // whenever createdMetrics is changed, call mock so test can validate passed props
    useEffect(() => {
      if (props.identifierProps?.isIdentifierEditable) {
        isIdentifierEditableMock()
      }
      nameIdRenderMock()
    }, [props])
    return <></>
  }
}))
const queryContentRenderMock = jest.fn()
jest.mock('@cv/components/QueryViewer/QueryViewer', () => ({
  __esModule: true,
  QueryContent: (props: QueryContentProps) => {
    useEffect(() => {
      queryContentRenderMock(props.query)
    })
    return (
      <>
        <button name={'fetchRecordsButton'} onClick={props.handleFetchRecords} />
      </>
    )
  }
}))

jest.mock(
  '@cv/components/CloudMetricsHealthSource/components/validationChart/MetricsValidationChart.tsx',
  () => (props: MetricsValidationChartProps) => {
    return (
      <>
        <button
          data-testid={'triggerOnRetryButtonMock'}
          onClick={() => {
            props.onRetry()
          }}
        />
      </>
    )
  }
)

function WrapperComponent(props: DynatraceCustomMetricsProps): JSX.Element {
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
      <SetupSourceTabs data={DynatraceMockHealthSourceData} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <DynatraceCustomMetrics {...props} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('Validate Dynatrace Custom Metrics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(cvService, 'useGetMetricPacks').mockReturnValue({ data: { data: [] }, refetch: jest.fn() } as any)
    jest
      .spyOn(cvService, 'useGetDynatraceSampleData')
      .mockReturnValue({ data: { data: [] }, refetch: jest.fn() } as any)
    jest.spyOn(cvService, 'useGetAllDynatraceServiceMetrics').mockReturnValue({
      data: {
        data: [
          {
            displayName: 'CPU per request',
            metricId: 'builtin:service.cpu.perRequest'
          }
        ]
      },
      refetch: jest.fn()
    } as any)
  })

  test('Ensure that QueryContent is rendered with proper query', async () => {
    const { container } = render(<WrapperComponent {...DYNATRACE_CUSTOM_METRICS_PROPS_MOCK} />)
    const queryContainerPanel = container.querySelector('[data-testid="querySpecificationsAndMapping-summary"]')
    // need to open accordion panel, so query content can be loaded
    if (queryContainerPanel) {
      act(() => {
        fireEvent.click(queryContainerPanel)
      })
    }
    // validate that query content component is called with expected metricSelector
    await waitFor(() => expect(queryContentRenderMock).toHaveBeenNthCalledWith(1, 'metric_selector_mock'))
  })

  test('Ensure that correct metricPacks are passed to SelectHealthSourceServices component', async () => {
    const metricPacksMock = { metaData: {}, resource: [], responseMessages: [] }
    jest
      .spyOn(cvService, 'useGetMetricPacks')
      .mockReturnValue(metricPacksMock as unknown as ReturnType<typeof cvService.useGetMetricPacks>)
    const { container } = render(<WrapperComponent {...DYNATRACE_CUSTOM_METRICS_PROPS_MOCK} />)
    const riskProfileContainer = container.querySelector('[data-testid="riskProfile-summary"]')
    if (riskProfileContainer) {
      act(() => {
        fireEvent.click(riskProfileContainer)
      })
    }
    // validate that query content component is called with expected metricSelector
    await waitFor(() => expect(healthSourceServicesRenderMock).toHaveBeenNthCalledWith(1, metricPacksMock))
  })

  test('should trigger sample data fetch when fetch records is clicked', async () => {
    const getSampleDataMock = jest.fn()
    getSampleDataMock.mockReturnValueOnce({ data: [] })
    jest.spyOn(cvService, 'useGetDynatraceSampleData').mockReturnValue({ mutate: getSampleDataMock } as any)

    const { container } = render(<WrapperComponent {...DYNATRACE_CUSTOM_METRICS_PROPS_MOCK} />)
    const queryContainer = container.querySelector('[data-testid="querySpecificationsAndMapping-summary"]')
    if (queryContainer) {
      act(() => {
        fireEvent.click(queryContainer)
      })
    }
    const fetchRecordsMockButton = container.querySelector('button[name="fetchRecordsButton"]')
    if (fetchRecordsMockButton) {
      act(() => {
        fireEvent.click(fetchRecordsMockButton)
      })
    }
    await waitFor(() => expect(getSampleDataMock).toHaveBeenCalledTimes(1))
  })

  test('ensure that manual query form field is updated when undo is clicked', async () => {
    const setFieldMock = jest.fn()
    const propsWithManualQuery: DynatraceCustomMetricsProps = {
      ...DYNATRACE_CUSTOM_METRICS_PROPS_MOCK,
      metricValues: { ...DYNATRACE_CUSTOM_METRICS_PROPS_MOCK.metricValues, isManualQuery: true },
      formikSetField: setFieldMock
    }
    const { container, getByTestId } = render(<WrapperComponent {...propsWithManualQuery} />)

    const queryContainerPanel = container.querySelector('[data-testid="querySpecificationsAndMapping-summary"]')
    // need to open accordion panel, so query content can be loaded
    if (queryContainerPanel) {
      act(() => {
        fireEvent.click(queryContainerPanel)
      })
    }
    act(() => {
      fireEvent.click(getByTestId('data-undo-manual-query-action'))
    })
    await waitFor(() => expect(setFieldMock).toHaveBeenCalledTimes(1))
  })

  test('ensure that query sample data is called when retry is clicked', async () => {
    const querySampleDataMock = jest.fn()
    querySampleDataMock.mockReturnValueOnce({ data: [] })
    jest
      .spyOn(cvService, 'useGetDynatraceSampleData')
      .mockReturnValue({ data: { data: [] }, mutate: querySampleDataMock } as any)

    const { container, getByTestId, rerender } = render(<WrapperComponent {...DYNATRACE_CUSTOM_METRICS_PROPS_MOCK} />)

    const queryContainer = container.querySelector('[data-testid="querySpecificationsAndMapping-summary"]')
    if (queryContainer) {
      act(() => {
        fireEvent.click(queryContainer)
      })
    }
    act(() => {
      fireEvent.click(getByTestId('triggerOnRetryButtonMock'))
    })
    await waitFor(() => expect(querySampleDataMock).toHaveBeenCalledTimes(1))

    const propsWithoutMetricSelector = {
      ...DYNATRACE_CUSTOM_METRICS_PROPS_MOCK,
      metricValues: { ...DYNATRACE_CUSTOM_METRICS_PROPS_MOCK.metricValues, metricSelector: '' }
    }
    rerender(<WrapperComponent {...propsWithoutMetricSelector} />)
    act(() => {
      fireEvent.click(getByTestId('triggerOnRetryButtonMock'))
    })
    // querySampleDataMock should not be called again
    await waitFor(() => expect(querySampleDataMock).toHaveBeenCalledTimes(1))
  })
  test('should validate that identifier is editable', async () => {
    const propsWithoutSelectedMetric = { ...DYNATRACE_CUSTOM_METRICS_PROPS_MOCK, selectedMetric: '' }
    render(<WrapperComponent {...propsWithoutSelectedMetric} />)
    expect(isIdentifierEditableMock).toHaveBeenNthCalledWith(1)
  })
})
