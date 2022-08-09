import React from 'react'
import { fireEvent, act, render, screen, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PrometheusThresholdProps as MockContextValues,
  formikInitialValues
} from '../../../__tests__/PrometheusMetricThreshold.mock'
import PrometheusFailFastThresholdTabContent from '../PrometheusFailFastThresholdTabContent'
import { PrometheusMetricThresholdContext } from '../../../PrometheusMetricThresholdConstants'

const WrappingComponent = () => {
  return (
    <TestWrapper>
      <Formik initialValues={formikInitialValues} onSubmit={jest.fn()} formName="appDHealthSourceform">
        <FormikForm>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <PrometheusMetricThresholdContext.Provider value={MockContextValues}>
            <PrometheusFailFastThresholdTabContent />
          </PrometheusMetricThresholdContext.Provider>
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('AppDIgnoreThresholdTabContent', () => {
  test('should render the component with all input fields', () => {
    const { container } = render(<WrappingComponent />)

    expect(container.querySelector("[name='failFastThresholds.0.metricType']")).toBeInTheDocument()
    expect(container.querySelector("[name='failFastThresholds.0.spec.action']")).toBeInTheDocument()
    expect(container.querySelector("[name='failFastThresholds.0.spec.spec.count']")).toBeInTheDocument()
    expect(container.querySelector("[name='failFastThresholds.0.criteria.type']")).toBeInTheDocument()
    expect(container.querySelector("[name='failFastThresholds.0.criteria.spec.greaterThan']")).toBeInTheDocument()
    expect(container.querySelector("[name='failFastThresholds.0.criteria.spec.lessThan']")).toBeInTheDocument()
  })

  test('should render the metricType dropdown with correct options', async () => {
    const { container } = render(<WrappingComponent />)

    expect(container.querySelector(`[name="failFastThresholds.0.metricType"]`)).toBeDisabled()
    expect(container.querySelector(`[name="failFastThresholds.0.metricType"]`)).toHaveValue('Custom')
  })

  test('should render the metric name dropdown with all metric names', async () => {
    const { container } = render(<WrappingComponent />)

    expect(container.querySelector(`[name="failFastThresholds.0.metricName"]`)).not.toBeDisabled()

    const selectCaretMetricName = container
      .querySelector(`[name="failFastThresholds.0.metricName"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaretMetricName).toBeInTheDocument()
    fireEvent.click(selectCaretMetricName!)
    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(1))
    expect(document.querySelectorAll('[class*="bp3-menu"] li')[0]).toHaveTextContent('Prometheus Metric')
  })

  test('should render the criteria dropdown and other functionalities should work properly', async () => {
    const { container } = render(<WrappingComponent />)

    const greaterThanInput = container.querySelector(`[name="failFastThresholds.0.criteria.spec.greaterThan"]`)
    const lessThanInput = container.querySelector(`[name="failFastThresholds.0.criteria.spec.lessThan"]`)

    expect(greaterThanInput).toBeInTheDocument()
    expect(lessThanInput).toBeInTheDocument()

    const selectCaretCriteriaType = container
      .querySelector(`[name="failFastThresholds.0.criteria.type"] + [class*="bp3-input-action"]`)
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

    expect(greaterThanInput).toBeInTheDocument()
    expect(lessThanInput).not.toBeInTheDocument()

    const selectCaretPercentageType = container
      .querySelector(`[name="failFastThresholds.0.criteria.criteriaPercentageType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaretPercentageType).toBeInTheDocument()
    fireEvent.click(selectCaretPercentageType!)

    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(2))

    act(() => {
      fireEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[1])
    })

    const greaterThanInput2 = container.querySelector(`[name="failFastThresholds.0.criteria.spec.greaterThan"]`)
    const lessThanInput2 = container.querySelector(`[name="failFastThresholds.0.criteria.spec.lessThan"]`)

    expect(greaterThanInput2).not.toBeInTheDocument()
    expect(lessThanInput2).toBeInTheDocument()
  })

  test('should render action dropdown with correct options', async () => {
    const { container } = render(<WrappingComponent />)

    const selectCaret = container
      .querySelector(`[name="failFastThresholds.0.spec.action"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaret).toBeInTheDocument()

    act(() => {
      fireEvent.click(selectCaret!)
    })

    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(3))
    expect(document.querySelectorAll('[class*="bp3-menu"] li')[0]).toHaveTextContent(
      'cv.monitoringSources.appD.failImmediately'
    )
    expect(document.querySelectorAll('[class*="bp3-menu"] li')[1]).toHaveTextContent(
      'cv.monitoringSources.appD.failAfterMultipleOccurrences'
    )
    expect(document.querySelectorAll('[class*="bp3-menu"] li')[2]).toHaveTextContent(
      'cv.monitoringSources.appD.failAfterConsecutiveOccurrences'
    )

    act(() => {
      fireEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[0])
    })

    const countInput = container.querySelector(`[name="failFastThresholds.0.spec.spec.count"]`)

    expect(countInput).toBeDisabled()

    const selectCaret2 = container
      .querySelector(`[name="failFastThresholds.0.spec.action"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaret2).toBeInTheDocument()

    act(() => {
      fireEvent.click(selectCaret2!)
    })

    act(() => {
      fireEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[1])
    })
    const countInput2 = container.querySelector(`[name="failFastThresholds.0.spec.spec.count"]`)
    expect(countInput2).not.toBeDisabled()

    const selectCaret3 = container
      .querySelector(`[name="failFastThresholds.0.spec.action"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaret3).toBeInTheDocument()

    act(() => {
      fireEvent.click(selectCaret3!)
    })

    act(() => {
      fireEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[2])
    })
    const countInput3 = container.querySelector(`[name="failFastThresholds.0.spec.spec.count"]`)
    expect(countInput3).not.toBeDisabled()
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
