import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import { TestWrapper } from '@common/utils/testUtils'
import CloudWatch from '../CloudWatch'
import {
  emptyHealthSource,
  metricPack,
  mockData,
  submitRequestDataPayload,
  submitRequestFormikPayload
} from './CloudWatch.mock'

jest.mock('services/cv', () => ({
  useGetMetricPacks: jest.fn().mockImplementation(() => {
    return { loading: false, error: null, data: metricPack } as any
  }),
  useGetRegions: jest.fn().mockImplementation(() => {
    return { data: { data: ['region 1', 'region 2'] } } as any
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
    expect(screen.getAllByText(/CustomMetric 1/)).toHaveLength(2)

    const metricNameInput = screen.getByPlaceholderText(/common.namePlaceholder/)

    expect(metricNameInput).toHaveValue('CustomMetric 1')

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
    await waitFor(() => expect(screen.getByText('cv.monitoringSources.appD.newGroupName')).not.toBeNull())
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
})
