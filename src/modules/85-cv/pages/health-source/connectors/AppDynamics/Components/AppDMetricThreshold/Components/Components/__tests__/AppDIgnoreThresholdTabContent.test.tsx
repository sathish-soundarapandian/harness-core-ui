import React from 'react'
import { fireEvent, act, render, screen, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import {
  AppDMetricThresholdProps as MockContextValues,
  formikInitialValues
} from '../../../__tests__/AppDMetricThreshold.mock'
import AppDIgnoreThresholdTabContent from '../AppDIgnoreThresholdTabContent'
import { AppDMetricThresholdContext } from '../../../AppDMetricThresholdConstants'

const WrappingComponent = () => {
  return (
    <TestWrapper>
      <Formik initialValues={formikInitialValues} onSubmit={jest.fn()} formName="dynatraceForm">
        <FormikForm>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <AppDMetricThresholdContext.Provider value={MockContextValues}>
            <AppDIgnoreThresholdTabContent />
          </AppDMetricThresholdContext.Provider>
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('AppDIgnoreThresholdTabContent', () => {
  test('should render the component with all input fields', () => {
    const { container } = render(<WrappingComponent />)

    expect(container.querySelector("[name='ignoreThresholds.0.metricType']")).toBeInTheDocument()
    expect(container.querySelector("[name='ignoreThresholds.0.groupName']")).toBeInTheDocument()
    expect(container.querySelector("[name='ignoreThresholds.0.criteria.type']")).toBeInTheDocument()
    expect(container.querySelector("[name='ignoreThresholds.0.criteria.spec.greaterThan']")).toBeInTheDocument()
    expect(container.querySelector("[name='ignoreThresholds.0.criteria.spec.lessThan']")).toBeInTheDocument()
  })

  test('should render the metricType dropdown with correct options', async () => {
    const { container } = render(<WrappingComponent />)

    const selectCaret = container
      .querySelector(`[name="ignoreThresholds.0.metricType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaret).toBeInTheDocument()

    fireEvent.click(selectCaret!)

    await waitFor(() => expect(screen.getByText(/Performance/)).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText(/Custom/)).toBeInTheDocument())
  })

  test('should render the Group based on metricType', async () => {
    const { container } = render(<WrappingComponent />)

    const selectCaret = container
      .querySelector(`[name="ignoreThresholds.0.metricType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaret).toBeInTheDocument()

    fireEvent.click(selectCaret!)
    await waitFor(() => expect(screen.getByText(/Performance/)).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText(/Custom/)).toBeInTheDocument())

    act(() => {
      fireEvent.click(screen.getByText(/Performance/))
    })

    expect(screen.getByPlaceholderText('cv.monitoringSources.appD.groupTransaction')).toBeInTheDocument()

    const selectCaret2 = container
      .querySelector(`[name="ignoreThresholds.0.metricType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    fireEvent.click(selectCaret2!)
    await waitFor(() => expect(screen.getByText(/Performance/)).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText(/Custom/)).toBeInTheDocument())
    act(() => {
      fireEvent.click(screen.getByText(/Custom/))
    })
    expect(screen.queryByPlaceholderText('cv.monitoringSources.appD.groupTransaction')).not.toBeInTheDocument()
  })

  test('should render the Groups dropdown with correct options', async () => {
    const { container } = render(<WrappingComponent />)

    const selectCaretMetricType = container
      .querySelector(`[name="ignoreThresholds.0.metricType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaretMetricType).toBeInTheDocument()
    fireEvent.click(selectCaretMetricType!)
    await waitFor(() => expect(screen.getByText(/Performance/)).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText(/Custom/)).toBeInTheDocument())
    act(() => {
      fireEvent.click(screen.getByText(/Custom/))
    })

    const selectCaretGroupName = container
      .querySelector(`[name="ignoreThresholds.0.groupName"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    fireEvent.click(selectCaretGroupName!)

    await waitFor(() => expect(screen.getByText(/g1/)).toBeInTheDocument())
  })

  test('should render the metric name dropdown as disabled if no value is selected for metric type', async () => {
    const { container } = render(<WrappingComponent />)

    expect(container.querySelector(`[name="ignoreThresholds.0.metricName"]`)).toBeDisabled()

    const selectCaretMetricType = container
      .querySelector(`[name="ignoreThresholds.0.metricType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaretMetricType).toBeInTheDocument()
    fireEvent.click(selectCaretMetricType!)
    await waitFor(() => expect(screen.getByText(/Performance/)).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText(/Custom/)).toBeInTheDocument())
    act(() => {
      fireEvent.click(screen.getByText(/Custom/))
    })

    const selectCaretGroupName = container
      .querySelector(`[name="ignoreThresholds.0.groupName"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    fireEvent.click(selectCaretGroupName!)

    act(() => {
      fireEvent.click(screen.getByText(/g1/))
    })
    expect(container.querySelector(`[name="ignoreThresholds.0.metricName"]`)).not.toBeDisabled()

    const selectCaretMetricName = container
      .querySelector(`[name="ignoreThresholds.0.metricName"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaretMetricName).toBeInTheDocument()
    fireEvent.click(selectCaretMetricName!)
    await waitFor(() => expect(screen.getByText(/appdMetric/)).toBeInTheDocument())
  })
  test('should render the criteria dropdown and other functionalities should work properly', async () => {
    const { container } = render(<WrappingComponent />)

    const greaterThanInput = container.querySelector(`[name="ignoreThresholds.0.criteria.spec.greaterThan"]`)
    const lessThanInput = container.querySelector(`[name="ignoreThresholds.0.criteria.spec.lessThan"]`)

    expect(greaterThanInput).toBeInTheDocument()
    expect(lessThanInput).toBeInTheDocument()

    const selectCaretCriteriaType = container
      .querySelector(`[name="ignoreThresholds.0.criteria.type"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaretCriteriaType).toBeInTheDocument()
    fireEvent.click(selectCaretCriteriaType!)

    expect(screen.getByText(/cv.monitoringSources.appD.absoluteValue/)).toBeInTheDocument()
    expect(screen.getByText(/cv.monitoringSources.appD.percentageDeviation/)).toBeInTheDocument()

    act(() => {
      fireEvent.click(screen.getByText(/cv.monitoringSources.appD.percentageDeviation/))
    })

    const greaterThanInput3 = container.querySelector(`[name="ignoreThresholds.0.criteria.spec.greaterThan"]`)
    const lessThanInput3 = container.querySelector(`[name="ignoreThresholds.0.criteria.spec.lessThan"]`)

    expect(greaterThanInput3).not.toBeInTheDocument()
    expect(lessThanInput3).toBeInTheDocument()
  })

  test('should check whether a new row is added when Add Threshold button is clicked', () => {
    render(<WrappingComponent />)

    expect(screen.getAllByTestId('ThresholdRow')).toHaveLength(1)

    const addButton = screen.getByTestId('AddThresholdButton')

    act(() => {
      fireEvent.click(addButton)
    })

    expect(screen.getAllByTestId('ThresholdRow')).toHaveLength(2)

    act(() => {
      fireEvent.click(screen.getAllByText('trash')[0])
    })

    expect(screen.getAllByTestId('ThresholdRow')).toHaveLength(1)
  })
})
