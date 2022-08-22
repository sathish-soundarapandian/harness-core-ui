import React from 'react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { fireEvent, act, render, screen, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import {
  formikInitialValuesCriteriaGreaterThanMock,
  formikInitialValuesCriteriaMock
} from '@cv/pages/health-source/common/MetricThresholds/__tests__/MetricThresholds.utils.mock'
import { formikInitialValues, MockContextValues, setThresholdStateMockFn } from './IgnoreThresholdsContent.mock'
import IgnoreThresholdContent from '../IgnoreThresholdsContent'
import { MetricThresholdContext } from '../../MetricThresholds.constants'

const WrappingComponent = ({ formValues }: { formValues?: any }): JSX.Element => {
  return (
    <TestWrapper>
      <Formik initialValues={formValues || formikInitialValues} onSubmit={jest.fn()} formName="appDHealthSourceform">
        <FormikForm>
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <MetricThresholdContext.Provider value={MockContextValues}>
            <IgnoreThresholdContent />
          </MetricThresholdContext.Provider>
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('DataDogIgnoreThresholdTabContent', () => {
  afterEach(() => {
    setThresholdStateMockFn.mockClear()
  })
  test('should render the component with all input fields', () => {
    const { container } = render(<WrappingComponent />)

    expect(container.querySelector("[name='ignoreThresholds.0.metricType']")).toBeInTheDocument()
    expect(container.querySelector("[name='ignoreThresholds.0.criteria.type']")).toBeInTheDocument()
    expect(container.querySelector("[name='ignoreThresholds.0.criteria.spec.greaterThan']")).toBeInTheDocument()
    expect(container.querySelector("[name='ignoreThresholds.0.criteria.spec.lessThan']")).toBeInTheDocument()
  })

  test('should render the metricType dropdown with correct options', async () => {
    const { container } = render(<WrappingComponent />)

    screen.debug(container, 30000)

    expect(container.querySelector(`[name="ignoreThresholds.0.metricType"]`)).toBeDisabled()
    expect(container.querySelector(`[name="ignoreThresholds.0.metricType"]`)).toHaveValue('Custom')
  })

  test('should render the metric name dropdown with all metric names', async () => {
    const { container } = render(<WrappingComponent />)

    expect(container.querySelector(`[name="ignoreThresholds.0.metricName"]`)).not.toBeDisabled()

    const selectCaretMetricName = container
      .querySelector(`[name="ignoreThresholds.0.metricName"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')

    expect(selectCaretMetricName).toBeInTheDocument()
    fireEvent.click(selectCaretMetricName!)
    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(1))
    expect(document.querySelectorAll('[class*="bp3-menu"] li')[0]).toHaveTextContent('dataDogMetric')
    expect(setThresholdStateMockFn).toBeCalledWith(expect.any(Function))
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

    expect(greaterThanInput).toBeInTheDocument()
    expect(lessThanInput).not.toBeInTheDocument()

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

  test('should check whether criteria section works correctly', () => {
    const { container } = render(<WrappingComponent formValues={formikInitialValuesCriteriaMock} />)

    const lessThanInput = container.querySelector('input[name="ignoreThresholds.0.criteria.spec.lessThan"]')
    const greaterThanInput = container.querySelector('input[name="ignoreThresholds.0.criteria.spec.greaterThan"]')
    const criteriaPercentageType = container.querySelector(
      'input[name="ignoreThresholds.0.criteria.criteriaPercentageType"]'
    )

    expect(lessThanInput).toBeInTheDocument()
    expect(lessThanInput).toHaveValue(21)
    expect(criteriaPercentageType).toHaveValue('cv.monitoringSources.appD.lesserThan')
    expect(greaterThanInput).toBeNull()
  })

  test('should check whether criteria section works correctly for greaterThan', () => {
    const { container } = render(<WrappingComponent formValues={formikInitialValuesCriteriaGreaterThanMock} />)

    const lessThanInput = container.querySelector('input[name="ignoreThresholds.0.criteria.spec.lessThan"]')
    const greaterThanInput = container.querySelector('input[name="ignoreThresholds.0.criteria.spec.greaterThan"]')
    const criteriaPercentageType = container.querySelector(
      'input[name="ignoreThresholds.0.criteria.criteriaPercentageType"]'
    )

    expect(greaterThanInput).toBeInTheDocument()
    expect(greaterThanInput).toHaveValue(21)
    expect(criteriaPercentageType).toHaveValue('cv.monitoringSources.appD.greaterThan')
    expect(lessThanInput).toBeNull()
  })
})
