import React from 'react'
import { fireEvent, act, render, screen, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
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
      <Formik initialValues={formikInitialValues} onSubmit={jest.fn()} formName="appDHealthSourceform">
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
    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(3))
    expect(document.querySelectorAll('[class*="bp3-menu"] li')[0]).toHaveTextContent('Performance')
    expect(document.querySelectorAll('[class*="bp3-menu"] li')[1]).toHaveTextContent('Errors')
    expect(document.querySelectorAll('[class*="bp3-menu"] li')[2]).toHaveTextContent('Custom')
  })

  test('should render the Group based on metricType', async () => {
    const { container } = render(<WrappingComponent />)

    const selectCaret = container
      .querySelector(`[name="ignoreThresholds.0.metricType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaret).toBeInTheDocument()

    fireEvent.click(selectCaret!)
    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(3))
    expect(document.querySelectorAll('[class*="bp3-menu"] li')[0]).toHaveTextContent('Performance')

    act(() => {
      fireEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[1])
    })

    expect(screen.getByPlaceholderText('cv.monitoringSources.appD.groupTransaction')).toBeInTheDocument()

    const selectCaret2 = container
      .querySelector(`[name="ignoreThresholds.0.metricType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    fireEvent.click(selectCaret2!)
    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(3))
    act(() => {
      fireEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[2])
    })
    expect(screen.queryByPlaceholderText('cv.monitoringSources.appD.groupTransaction')).not.toBeInTheDocument()
  })

  test('should render the Groups dropdown with correct options', async () => {
    const { container } = render(<WrappingComponent />)

    screen.debug(container, 30000)

    const selectCaretMetricType = container
      .querySelector(`[name="ignoreThresholds.0.metricType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaretMetricType).toBeInTheDocument()
    fireEvent.click(selectCaretMetricType!)
    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(3))
    act(() => {
      fireEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[2])
    })

    const selectCaretGroupName = container
      .querySelector(`[name="ignoreThresholds.0.groupName"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    fireEvent.click(selectCaretGroupName!)

    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(1))
    expect(document.querySelectorAll('[class*="bp3-menu"] li')[0]).toHaveTextContent('g1')
  })

  test('should render the metric name dropdown as disabled if no value is selected for metric type', async () => {
    const { container } = render(<WrappingComponent />)

    expect(container.querySelector(`[name="ignoreThresholds.0.metricName"]`)).toBeDisabled()

    const selectCaretMetricType = container
      .querySelector(`[name="ignoreThresholds.0.metricType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaretMetricType).toBeInTheDocument()
    fireEvent.click(selectCaretMetricType!)
    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(3))
    act(() => {
      fireEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[2])
    })

    const selectCaretGroupName = container
      .querySelector(`[name="ignoreThresholds.0.groupName"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    fireEvent.click(selectCaretGroupName!)

    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(1))
    act(() => {
      fireEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[0])
    })
    expect(container.querySelector(`[name="ignoreThresholds.0.metricName"]`)).not.toBeDisabled()

    const selectCaretMetricName = container
      .querySelector(`[name="ignoreThresholds.0.metricName"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaretMetricName).toBeInTheDocument()
    fireEvent.click(selectCaretMetricName!)
    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(1))
    expect(document.querySelectorAll('[class*="bp3-menu"] li')[0]).toHaveTextContent('appdMetric')
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

    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(2))

    expect(document.querySelectorAll('[class*="bp3-menu"] li')[0]).toHaveTextContent(
      'cv.monitoringSources.appD.absoluteValue'
    )
    expect(document.querySelectorAll('[class*="bp3-menu"] li')[1]).toHaveTextContent(
      'cv.monitoringSources.appD.percentageDeviation'
    )

    act(() => {
      fireEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[1])
    })

    const selectCaretPercentageType = container
      .querySelector(`[name="ignoreThresholds.0.criteria.criteriaPercentageType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaretPercentageType).toBeInTheDocument()
    fireEvent.click(selectCaretPercentageType!)

    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(2))

    act(() => {
      fireEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[1])
    })

    const greaterThanInput2 = container.querySelector(`[name="ignoreThresholds.0.criteria.spec.greaterThan"]`)
    const lessThanInput2 = container.querySelector(`[name="ignoreThresholds.0.criteria.spec.lessThan"]`)

    expect(greaterThanInput2).not.toBeInTheDocument()
    expect(lessThanInput2).toBeInTheDocument()

    const selectCaretPercentageType2 = container
      .querySelector(`[name="ignoreThresholds.0.criteria.criteriaPercentageType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaretPercentageType2).toBeInTheDocument()
    fireEvent.click(selectCaretPercentageType2!)

    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(2))

    act(() => {
      fireEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[0])
    })

    const greaterThanInput3 = container.querySelector(`[name="ignoreThresholds.0.criteria.spec.greaterThan"]`)
    const lessThanInput3 = container.querySelector(`[name="ignoreThresholds.0.criteria.spec.lessThan"]`)

    expect(greaterThanInput3).toBeInTheDocument()
    expect(lessThanInput3).not.toBeInTheDocument()
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
