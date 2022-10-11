/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, act, screen } from '@testing-library/react'
import { fillAtForm, InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { GCOMetricsHealthSource } from '../GCOMetricsHealthSource'
import {
  MetricPackResponse,
  MockDataDashBOardDetails,
  MockQuery,
  MockQueryWithGroupBy,
  MockValidationResponse,
  MockValidationResponseWithMultipleTxns,
  sourceDataUpdated,
  sourceDataWithMetricPacks
} from './GCOMetricsHealthSource.mock'
import { FieldNames } from '../GCOMetricsHealthSource.constants'
import type { GCOMetricsHealthSourceProps } from '../GCOMetricsHealthSource.type'

function WrapperComponent({ data, onSubmit }: GCOMetricsHealthSourceProps) {
  return (
    <TestWrapper>
      <SetupSourceTabs data={data} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <GCOMetricsHealthSource data={data} onSubmit={onSubmit} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

const mutateMock = jest.fn().mockReturnValue(
  Promise.resolve({
    ...MockValidationResponse
  })
)

jest.mock('services/cv', () => ({
  useGetStackdriverDashboardDetail: jest.fn().mockImplementation(() => {
    return { data: MockDataDashBOardDetails, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetMetricPacks: jest.fn().mockImplementation(() => {
    return { data: { data: [] } } as any
  }),
  useGetMetricNames: jest.fn().mockImplementation(() => {
    return { data: { data: [] } } as any
  }),
  useGetStackdriverSampleData: jest.fn().mockImplementation(() => {
    return { mutate: mutateMock, cancel: jest.fn() }
  })
}))

describe('Test GCOMetricsHealthSource', () => {
  test('Should show please Enter Query when ther is no query in the text area', async () => {
    const { container, getByText } = render(<WrapperComponent data={sourceDataUpdated} onSubmit={jest.fn()} />)
    expect(container).toMatchSnapshot()

    await setFieldValue({ container, type: InputTypes.TEXTAREA, fieldId: FieldNames.QUERY, value: MockQuery })
    const fetchRecordsButton = await waitFor(() => getByText('cv.monitoringSources.gcoLogs.fetchRecords'))
    expect(fetchRecordsButton).not.toBeNull()
    act(() => {
      fireEvent.click(fetchRecordsButton)
    })
    await waitFor(() => {
      fireEvent.change(container.querySelector('textarea')!, { target: { value: '' } })
    })

    expect(container.querySelector('[data-icon="fullscreen"]')).not.toBeNull()

    expect(container.querySelector('[data-icon="main-notes"]')).not.toBeNull()
    expect(getByText('cv.monitoringSources.gco.mapMetricsToServicesPage.enterQueryForValidation')).not.toBeNull()
  })

  test('Ensure validation api is called on query input', async () => {
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: { resource: [{ identifier: 'Errors' }, { identifier: 'Performance' }] }
    } as any)

    const sampleDataSpy = jest.spyOn(cvService, 'useGetStackdriverSampleData')
    const mutateMockLocal = jest.fn().mockReturnValue(
      Promise.resolve({
        ...MockValidationResponse
      })
    )

    sampleDataSpy.mockReturnValue({
      mutate: mutateMockLocal as unknown,
      cancel: jest.fn() as unknown
    } as any)

    const { container, getByText } = render(<WrapperComponent onSubmit={jest.fn()} data={sourceDataUpdated} />)

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await setFieldValue({ container, type: InputTypes.TEXTAREA, fieldId: FieldNames.QUERY, value: MockQuery })

    expect(getByText('cv.monitoringSources.gcoLogs.submitQueryToSeeRecords')).toBeDefined()

    const fetchRecordsButton = await waitFor(() => getByText('cv.monitoringSources.gcoLogs.fetchRecords'))
    expect(fetchRecordsButton).not.toBeNull()
    expect(getByText('cv.monitoringSources.gcoLogs.submitQueryToSeeRecords')).not.toBeNull()
    act(() => {
      fireEvent.click(fetchRecordsButton)
    })

    await waitFor(() => expect(mutateMockLocal).toHaveBeenCalledTimes(1))
    expect(container.querySelector('[class*="highcharts"]')).not.toBeNull()

    act(() => {
      fireEvent.click(container.querySelector('[data-icon="fullscreen"]')!)
    })
    await waitFor(() => expect(document.body.querySelector('[data-testid="monaco-editor"]')).not.toBeNull())
    await waitFor(() => expect(mutateMockLocal).toHaveBeenCalledTimes(1))
  })

  test('Ensure that when validation api throws error or returns no data, correct content is displayed', async () => {
    const sampleDataSpy = jest.spyOn(cvService, 'useGetStackdriverSampleData')
    const mutateMockLocal = jest.fn().mockRejectedValue({ data: { detailedMessage: 'mock error' } })
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: { resource: [{ identifier: 'Errors' }, { identifier: 'Performance' }] }
    } as any)

    sampleDataSpy.mockReturnValue({
      mutate: mutateMockLocal as unknown,
      cancel: jest.fn() as unknown
    } as any)
    const { container, getByText, rerender } = render(
      <WrapperComponent onSubmit={jest.fn()} data={sourceDataUpdated} />
    )

    // error case
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await setFieldValue({ container, type: InputTypes.TEXTAREA, fieldId: FieldNames.QUERY, value: MockQuery })
    const fetchRecordsButton = await waitFor(() => getByText('cv.monitoringSources.gcoLogs.fetchRecords'))
    expect(fetchRecordsButton).not.toBeNull()
    act(() => {
      fireEvent.click(fetchRecordsButton)
    })
    await waitFor(() => expect(getByText('mock error')).not.toBeNull())
    expect(container.querySelector('[class*="highcharts"]')).toBeNull()

    // no data case
    mutateMockLocal.mockReturnValue(
      Promise.resolve({
        data: { data: [] }
      })
    )
    sampleDataSpy.mockReturnValue({ mutate: mutateMockLocal as unknown, cancel: jest.fn() as unknown } as any)

    rerender(<WrapperComponent onSubmit={jest.fn()} data={sourceDataUpdated} />)

    await setFieldValue({
      container,
      type: InputTypes.TEXTAREA,
      fieldId: FieldNames.QUERY,
      value: '{ "dsadd": "dsfs" }'
    })
    act(() => {
      fireEvent.click(fetchRecordsButton)
    })
    await waitFor(() => expect(getByText('cv.monitoringSources.gco.mapMetricsToServicesPage.noDataForQuery')))

    //retry api
    fireEvent.click(getByText('retry'))
    await waitFor(() => expect(mutateMockLocal).toHaveBeenCalledTimes(3))
  })

  test('Ensure that when too many metrics are returned for a groupBy query, validation is displayed', async () => {
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: { resource: [{ identifier: 'Errors' }, { identifier: 'Performance' }] }
    } as any)

    const sampleDataSpy = jest.spyOn(cvService, 'useGetStackdriverSampleData')
    const mutateMockLocal = jest.fn().mockReturnValue(
      Promise.resolve({
        ...MockValidationResponseWithMultipleTxns
      })
    )

    sampleDataSpy.mockReturnValue({ mutate: mutateMockLocal as unknown, cancel: jest.fn() as unknown } as any)

    const { container, getByText } = render(<WrapperComponent onSubmit={jest.fn()} data={sourceDataUpdated} />)

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await setFieldValue({
      container,
      type: InputTypes.TEXTAREA,
      fieldId: FieldNames.QUERY,
      value: MockQueryWithGroupBy
    })

    const fetchRecordsButton = await waitFor(() => getByText('cv.monitoringSources.gcoLogs.fetchRecords'))
    expect(fetchRecordsButton).not.toBeNull()
    act(() => {
      fireEvent.click(fetchRecordsButton)
    })

    // assign a query with gruopByFields and ensure validation is there
    await waitFor(() => expect(mutateMockLocal).toHaveBeenCalledTimes(1))
    expect(container.querySelector('[class*="highcharts"]')).not.toBeNull()
    await waitFor(() =>
      expect(getByText('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.tooManyMetrics')).not.toBeNull()
    )

    // remove the groupByFields value and ensure validation message disappeared
    await setFieldValue({
      container,
      type: InputTypes.TEXTAREA,
      fieldId: FieldNames.QUERY,
      value: MockQuery
    })
    act(() => {
      fireEvent.click(fetchRecordsButton)
    })
    await waitFor(() => expect(mutateMockLocal).toHaveBeenCalledTimes(2))
    expect(container.querySelector('[class*="highcharts"]')).not.toBeNull()
    await waitFor(() => expect(container.querySelector('[class*="tooManyRecords"]')).toBeNull())
  })

  test('Ensure error is thrown when assign component has no service selected', async () => {
    const { container, getByText } = render(<WrapperComponent onSubmit={jest.fn()} data={sourceDataUpdated} />)
    fireEvent.click(getByText('submit'))
    // Error is show below sli checkbox
    await waitFor(() =>
      expect(getByText('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline')).toBeInTheDocument()
    )
    await fillAtForm([
      { container, type: InputTypes.CHECKBOX, fieldId: 'continuousVerification', value: 'continuousVerification' }
    ])
    await waitFor(() => expect(container.querySelector('div[data-name="sli"] .FormError--error')).toBeNull())
  })

  test('should render input with identifier field', () => {
    const onSubmitMock = jest.fn()
    const { container } = render(<WrapperComponent onSubmit={onSubmitMock} data={sourceDataUpdated} />)

    expect(screen.getByText(/^id$/i)).toBeInTheDocument()
    expect(container.querySelector('.InputWithIdentifier--txtNameContainer')).toBeInTheDocument()
  })
  test('should have initial value assigned', async () => {
    const onSubmitMock = jest.fn()
    render(<WrapperComponent onSubmit={onSubmitMock} data={{}} />)

    expect(screen.getByText(/cv.monitoringSources.gco.noMetricData/i)).toBeInTheDocument()
  })

  test('Ensure service instance field is displayed when clicking on continuous verification', async () => {
    const onSubmitMock = jest.fn()
    const { container, getByText } = render(<WrapperComponent onSubmit={onSubmitMock} data={sourceDataUpdated} />)
    await waitFor(() => expect(getByText('cv.monitoredServices.continuousVerification')).not.toBeNull())
    fireEvent.click(getByText('cv.monitoredServices.continuousVerification'))
    await waitFor(() =>
      expect(container.querySelector(`input[name=${FieldNames.SERVICE_INSTANCE_FIELD}]`)).not.toBeNull()
    )

    fireEvent.click(getByText('cv.monitoredServices.continuousVerification'))
    await waitFor(() => expect(container.querySelector(`input[name=${FieldNames.SERVICE_INSTANCE_FIELD}]`)).toBeNull())
  })

  test('Ensure that when a metric is selected in the nav, the content in the form is rendered', async () => {
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: { resource: [{ identifier: 'Errors' }, { identifier: 'Performance' }] }
    } as any)

    const sampleDataSpy = jest.spyOn(cvService, 'useGetStackdriverSampleData')
    const mutateMockLocal = jest.fn().mockReturnValue(
      Promise.resolve({
        ...MockValidationResponse
      })
    )

    sampleDataSpy.mockReturnValue({ mutate: mutateMockLocal as unknown, cancel: jest.fn() as unknown } as any)
    const onSubmitMock = jest.fn()
    const { container, getByText } = render(<WrapperComponent onSubmit={onSubmitMock} data={sourceDataUpdated} />)
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    await waitFor(() =>
      expect(container.querySelector(`input[name="metricName"]`)).toHaveValue('kubernetes.io/container/restart_count')
    )

    fireEvent.click(getByText('submit'))
    expect(onSubmitMock).not.toHaveBeenCalled()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('ensure metric name is updated and saved when user updates it for manual query', async () => {
    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: MetricPackResponse
    } as any)
    const onSubmitMock = jest.fn()

    const { container } = render(<WrapperComponent onSubmit={onSubmitMock} data={sourceDataUpdated} />)

    // select metric option and fill out metric name in displayed modal
    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const manualQueryOption = container.querySelector('.manualQuery')
    if (!manualQueryOption) {
      throw Error('manual query was not rendered.')
    }
    fireEvent.click(manualQueryOption)

    await waitFor(() =>
      expect(document.body.querySelector('[class*="ManualInputModal"] input[name="metricName"]')).not.toBeNull()
    )
    const metricNameInput = document.body.querySelector('[class*="ManualInputModal"] input[name="metricName"]')
    if (!metricNameInput) {
      throw Error('Metric name was not found.')
    }

    fireEvent.change(metricNameInput, { target: { value: 'solo-dolo' } })
    const buttons = document.body.querySelectorAll('[class*="buttonContainer"] button')
    if (!buttons) {
      throw Error('Submit button was not rendered.')
    }

    fireEvent.click(buttons[1])
    await waitFor(() =>
      expect(document.body.querySelector('[class*="ManualInputModal"] input[name="metricName"]')).toBeNull()
    )
    await waitFor(() => expect(container.querySelector('input[value="metric_1"]')).not.toBeNull())

    await fillAtForm([
      { container, type: InputTypes.CHECKBOX, fieldId: 'continuousVerification', value: 'continuousVerification' }
    ])

    // fill out parts of the form
    await fillAtForm([
      { container, type: InputTypes.TEXTAREA, fieldId: FieldNames.QUERY, value: MockQuery },
      { container, type: InputTypes.RADIOS, fieldId: FieldNames.RISK_CATEGORY, value: 'Errors/ERROR' },
      { container, type: InputTypes.CHECKBOX, fieldId: FieldNames.HIGHER_BASELINE_DEVIATION, value: 'higher' }
    ])

    // enter service and environment values and tags
    const metricTagsInput = container.querySelector(
      '[class*="nameAndMetricTagContainer"] [data-id*="metricTags"] input'
    )
    if (!metricTagsInput) {
      throw Error('metric tags was not rendered.')
    }

    fireEvent.change(metricTagsInput, { target: { value: 'metricTag' } })
    await waitFor(() => expect(container.querySelector('input[value="metricTag"]')).not.toBeNull())

    const submitFormButton = container.querySelector('button[class*="nextButton"]')
    if (!submitFormButton) {
      throw Error('submit form button does not exist.')
    }

    fireEvent.click(submitFormButton)
  })
  describe('Metric thresholds', () => {
    test('should render metric thresholds', () => {
      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)
      render(<WrapperComponent data={sourceDataWithMetricPacks} onSubmit={jest.fn()} />)

      expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (1)')).toBeInTheDocument()
      expect(screen.getByText('cv.monitoringSources.appD.failFastThresholds (1)')).toBeInTheDocument()
      const addButton = screen.getByTestId('AddThresholdButton')

      expect(addButton).toBeInTheDocument()

      fireEvent.click(addButton)

      expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (2)')).toBeInTheDocument()
    })

    test('should not render metric thresholds when feature flag is turned off', () => {
      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(false)
      render(<WrapperComponent data={sourceDataUpdated} onSubmit={jest.fn()} />)

      expect(screen.queryByText('cv.monitoringSources.appD.ignoreThresholds (0)')).not.toBeInTheDocument()
      expect(screen.queryByText('cv.monitoringSources.appD.failFastThresholds (0)')).not.toBeInTheDocument()
    })

    test('should not render metric thresholds there is not custom metric', () => {
      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)
      render(<WrapperComponent data={{}} onSubmit={jest.fn()} />)

      expect(screen.queryByText('cv.monitoringSources.appD.ignoreThresholds (0)')).not.toBeInTheDocument()
      expect(screen.queryByText('cv.monitoringSources.appD.failFastThresholds (0)')).not.toBeInTheDocument()
    })
  })
})
