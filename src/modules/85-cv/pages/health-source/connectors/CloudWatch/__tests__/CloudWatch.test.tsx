import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as cvService from 'services/cv'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import { TestWrapper } from '@common/utils/testUtils'
import CloudWatch from '../CloudWatch'
import {
  emptyHealthSource,
  metricPack,
  mockData,
  sampleDataMockResponse,
  submitRequestDataPayload,
  submitRequestFormikPayload,
  testPathParams
} from './CloudWatch.mock'

jest.mock('services/cv', () => ({
  useGetMetricPacks: jest.fn().mockImplementation(() => {
    return { loading: false, error: null, data: metricPack } as any
  }),
  useGetRegions: jest.fn().mockImplementation(() => {
    return { data: { data: ['region 1', 'region 2'] } } as any
  }),
  useGetSampleDataForQuery: jest.fn().mockImplementation(() => {
    return { data: { data: sampleDataMockResponse } } as any
  })
}))

describe('CloudWatch', () => {
  beforeAll(() => {
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should not render the component, if the feature flag is disabled', () => {
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(false)

    const onSubmit = jest.fn()
    const { container } = render(
      <TestWrapper>
        <CloudWatch data={mockData} onSubmit={onSubmit} />
      </TestWrapper>
    )

    expect(container.firstChild).toBeNull()
  })

  test('should render the component, if the feature flag is enabled', () => {
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)

    const onSubmit = jest.fn()
    render(
      <TestWrapper>
        <CloudWatch data={mockData} onSubmit={onSubmit} />
      </TestWrapper>
    )

    expect(screen.getByTestId(/cloudWatchContainer/)).toBeInTheDocument()
  })

  test('should show error message, if submitted with no custom metrics', async () => {
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)

    const onSubmit = jest.fn()
    render(
      <TestWrapper>
        <CloudWatch data={emptyHealthSource} onSubmit={onSubmit} />
      </TestWrapper>
    )

    const regionDropdown = screen.getByPlaceholderText(
      '- cv.healthSource.connectors.CloudWatch.awsSelectorPlaceholder -'
    )

    act(() => {
      userEvent.click(regionDropdown)
    })

    await waitFor(() => {
      expect(document.querySelector('ul.bp3-menu')).toBeInTheDocument()
      expect(screen.getByText(/region 1/)).toBeInTheDocument()
    })

    act(() => {
      userEvent.click(screen.getByText('region 1'))
    })

    expect(regionDropdown).toHaveValue('region 1')

    const submitButton = screen.getAllByText(/submit/)[0]

    act(() => {
      userEvent.click(submitButton)
    })

    await waitFor(() =>
      expect(
        screen.getByText(/cv.healthSource.connectors.CloudWatch.validationMessage.customMetrics/)
      ).toBeInTheDocument()
    )
  })

  test('should add new custom metric upon clicking Add custom metric button', async () => {
    const onSubmit = jest.fn()
    const { container } = render(
      <TestWrapper>
        <CloudWatch data={emptyHealthSource} onSubmit={onSubmit} />
      </TestWrapper>
    )

    const regionDropdown = screen.getByPlaceholderText(
      '- cv.healthSource.connectors.CloudWatch.awsSelectorPlaceholder -'
    )

    act(() => {
      userEvent.click(regionDropdown)
    })

    await waitFor(() => {
      expect(document.querySelector('ul.bp3-menu')).toBeInTheDocument()
      expect(screen.getByText(/region 1/)).toBeInTheDocument()
    })

    act(() => {
      userEvent.click(screen.getByText(/region 1/))
    })

    expect(regionDropdown).toHaveValue('region 1')

    await waitFor(() => {
      expect(screen.getByTestId('addCustomMetricButton')).not.toBeDisabled()
    })

    act(() => {
      userEvent.click(screen.getByTestId('addCustomMetricButton'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('addCustomMetricButton')).toBeDisabled()
    })

    expect(screen.getByText(/cv.monitoringSources.prometheus.querySpecificationsAndMappings/)).toBeInTheDocument()
    expect(screen.getAllByText(/customMetric 1/)).toHaveLength(1)
    expect(screen.getAllByText(/customMetric_1/)).toHaveLength(1)

    const metricNameInput = screen.getByPlaceholderText(/common.namePlaceholder/)

    expect(metricNameInput).toHaveValue('customMetric 1')

    const groupNameDropdown = container
      .querySelector('input[name="customMetrics.0.groupName"] + [class*="bp3-input-action"]')
      ?.querySelector('[data-icon="chevron-down"]')

    if (!groupNameDropdown) {
      throw Error('Input was not rendered.')
    }

    // click on new option
    userEvent.click(groupNameDropdown)
    await waitFor(() => expect(screen.getByText('cv.addNew')).not.toBeNull())
    userEvent.click(screen.getByText('cv.addNew'))

    //expect modal to show and fill out new name
    await waitFor(() =>
      expect(screen.getByText('cv.monitoringSources.prometheus.newPrometheusGroupName')).not.toBeNull()
    )
    await setFieldValue({
      container: document.body,
      type: InputTypes.TEXTFIELD,
      fieldId: 'name',
      value: 'G1'
    })

    userEvent.click(screen.getAllByText('submit')[0])

    const expressionInput = container.querySelector('textarea[name="customMetrics.0.expression"]')

    expect(expressionInput).toBeInTheDocument()

    act(() => {
      userEvent.type(expressionInput!, 'SELECT *')
    })

    expect(expressionInput).toHaveValue('SELECT *')

    const assignAccordion = screen.getByText(/cv.monitoringSources.assign/)

    act(() => {
      userEvent.click(assignAccordion!)
    })

    expect(screen.getByText('cv.slos.sli')).toBeInTheDocument()
    expect(screen.getByText('cv.monitoredServices.monitoredServiceTabs.serviceHealth')).toBeInTheDocument()
    expect(screen.getByText('cv.monitoredServices.continuousVerification')).toBeInTheDocument()

    const sliCheckbox = container.querySelector('input[name="customMetrics.0.sli.enabled"]')
    const serviceHealthCheckbox = container.querySelector(
      'input[name="customMetrics.0.analysis.liveMonitoring.enabled"]'
    )

    act(() => {
      userEvent.click(sliCheckbox!)
      userEvent.click(serviceHealthCheckbox!)
    })

    expect(sliCheckbox).toBeChecked()
    expect(serviceHealthCheckbox).toBeChecked()

    const actHigher = container.querySelector('input[name="customMetrics.0.analysis.higherBaselineDeviation"]')

    expect(actHigher).toBeInTheDocument()
    expect(actHigher).not.toBeChecked()

    act(() => {
      userEvent.click(actHigher!)
    })

    expect(actHigher).toBeChecked()

    act(() => {
      userEvent.click(actHigher!)
    })

    expect(actHigher).not.toBeChecked()

    const cvCheckbox = screen.getByText('cv.monitoredServices.continuousVerification')

    act(() => {
      userEvent.click(cvCheckbox!)
    })

    const serviceIdentifierInput = container.querySelector(
      'input[name="customMetrics.0.responseMapping.serviceInstanceJsonPath"]'
    )

    expect(serviceIdentifierInput).toBeInTheDocument()

    act(() => {
      userEvent.type(serviceIdentifierInput!, 'test value')
    })

    const serviceIdentifierInput2 = container.querySelector(
      'input[name="customMetrics.0.responseMapping.serviceInstanceJsonPath"]'
    )

    expect(serviceIdentifierInput2).toHaveValue('test value')

    const riskCategoryLabel = screen.getByText(/cv.monitoringSources.riskCategoryLabel/)

    expect(riskCategoryLabel).toBeInTheDocument()

    const riskProfileRadio = screen.getByLabelText('Errors/Number of Errors')

    expect(riskProfileRadio).toBeInTheDocument()
  })

  test('should check correct payload is being passed upon clicking submit', () => {
    const onSubmit = jest.fn()
    render(
      <TestWrapper>
        <CloudWatch data={mockData} onSubmit={onSubmit} />
      </TestWrapper>
    )

    const submit = screen.getByText('submit')

    act(() => {
      userEvent.click(submit)
    })

    expect(onSubmit).toHaveBeenCalledWith(submitRequestDataPayload, submitRequestFormikPayload)
  })

  test('should check new metric is added correctly', () => {
    const onSubmit = jest.fn()
    const { container } = render(
      <TestWrapper>
        <CloudWatch data={mockData} onSubmit={onSubmit} />
      </TestWrapper>
    )

    const addCustomMetricButton = screen.getByTestId('addCustomMetricButton')
    expect(addCustomMetricButton).not.toBeDisabled()

    const metricNameInput = screen.getByPlaceholderText(/common.namePlaceholder/)

    expect(metricNameInput).toHaveValue('CustomMetric 1')

    act(() => {
      userEvent.click(addCustomMetricButton)
    })

    const metricName2 = container.querySelector('input[name="customMetrics.1.metricName"]')

    expect(metricName2).toHaveValue('customMetric 2')

    expect(screen.getByTestId('sideNav-customMetric 2')).toBeInTheDocument()
    expect(screen.getByTestId('sideNav-CustomMetric 1')).toBeInTheDocument()

    act(() => {
      userEvent.click(screen.getByTestId('sideNav-CustomMetric 1'))
    })

    expect(metricName2).not.toBeInTheDocument()

    const deleteMetricIcons = container.querySelectorAll('span[data-icon="main-delete"]')

    expect(deleteMetricIcons).toHaveLength(2)

    act(() => {
      userEvent.click(deleteMetricIcons[1])
    })

    expect(screen.queryByText('CustomMetric 2')).not.toBeInTheDocument()
  })

  test('should show loading skeleton for metric packs, if metric pack call is in progress', () => {
    const onSubmit = jest.fn()

    const getMetricPackSpy = jest.spyOn(cvService, 'useGetMetricPacks')
    getMetricPackSpy.mockReturnValue({
      data: null,
      loading: true,
      absolutePath: '',
      cancel: () => Promise.resolve(void 0),
      refetch: () => Promise.resolve(void 0),
      response: null,
      error: null
    })

    render(
      <TestWrapper>
        <CloudWatch data={mockData} onSubmit={onSubmit} />
      </TestWrapper>
    )

    const assignAccordion = screen.getByText(/cv.monitoringSources.assign/)

    act(() => {
      userEvent.click(assignAccordion!)
    })

    expect(screen.getAllByTestId('metricPackOptions-loading')).toHaveLength(1)
  })

  test('should test query section features', async () => {
    const refetch = jest.fn()

    const getRegionsSpy = jest.spyOn(cvService, 'useGetSampleDataForQuery')
    getRegionsSpy.mockReturnValue({
      data: { data: sampleDataMockResponse },
      loading: false,
      absolutePath: '',
      cancel: () => Promise.resolve(void 0),
      refetch: refetch,
      response: null,
      error: null
    })

    const { container } = render(
      <TestWrapper pathParams={testPathParams}>
        <CloudWatch data={emptyHealthSource} onSubmit={() => Promise.resolve()} />
      </TestWrapper>
    )

    act(() => {
      userEvent.click(screen.getByTestId('addCustomMetricButton'))
    })

    await waitFor(() => {
      expect(screen.getByText(/cv.healthSource.connectors.CloudWatch.fetchDataButtonText/)).toBeInTheDocument()
    })

    expect(screen.getByText(/cv.healthSource.connectors.CloudWatch.validationMessage.submitQuery/)).toBeInTheDocument()
    const fetchDataButton = screen.getByText(/cv.healthSource.connectors.CloudWatch.fetchDataButtonText/)

    expect(fetchDataButton).toBeInTheDocument()

    act(() => {
      userEvent.click(fetchDataButton)
    })

    expect(refetch).not.toHaveBeenCalled()

    const regionDropdown = screen.getByPlaceholderText(
      '- cv.healthSource.connectors.CloudWatch.awsSelectorPlaceholder -'
    )

    act(() => {
      userEvent.click(regionDropdown)
    })

    await waitFor(() => {
      expect(document.querySelector('ul.bp3-menu')).toBeInTheDocument()
      expect(screen.getByText(/region 1/)).toBeInTheDocument()
    })

    act(() => {
      userEvent.click(screen.getByText('region 1'))
    })

    expect(regionDropdown).toHaveValue('region 1')

    const expressionInput = container.querySelector('textarea[name="customMetrics.0.expression"]')

    expect(expressionInput).toBeInTheDocument()

    act(() => {
      userEvent.type(expressionInput!, 'SELECT *')
    })

    expect(expressionInput).toHaveValue('SELECT *')

    await waitFor(() => {
      expect(screen.getByText(/cv.healthSource.connectors.CloudWatch.fetchDataButtonText/)).not.toBeDisabled()
    })

    act(() => {
      userEvent.click(screen.getByText(/cv.healthSource.connectors.CloudWatch.fetchDataButtonText/))
    })

    expect(refetch).toHaveBeenCalled()

    await waitFor(() => {
      expect(container.querySelector('.metricChartHolder')).toBeInTheDocument()
    })
  })

  test('should show loading dropdown placeholder if region is loading', () => {
    const onSubmit = jest.fn()

    const getRegionsSpy = jest.spyOn(cvService, 'useGetRegions')
    getRegionsSpy.mockReturnValue({
      data: { data: [] },
      loading: true,
      absolutePath: '',
      cancel: () => Promise.resolve(void 0),
      refetch: () => Promise.resolve(void 0),
      response: null,
      error: null
    })

    render(
      <TestWrapper>
        <CloudWatch data={emptyHealthSource} onSubmit={onSubmit} />
      </TestWrapper>
    )

    const regionLoadingDropdown = screen.getByPlaceholderText('- loading -')

    expect(regionLoadingDropdown).toBeInTheDocument()
    expect(regionLoadingDropdown).toBeDisabled()
  })
})
