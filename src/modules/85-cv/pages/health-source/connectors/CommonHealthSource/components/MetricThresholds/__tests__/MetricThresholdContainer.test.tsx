import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import { Formik, FormikForm } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'

import type { MetricThresholdContainerProps } from '../MetricThresholdContainer'
import MetricThresholdContainer from '../MetricThresholdContainer'
import {
  configurationsPageInitialValues,
  healthSourceConfig,
  healthSourceConfigWithMetricThresholdsDisabled,
  healthSourceConfigWithMetricPacksEnabled,
  healthSourceConfigWithMetricThresholdsEnabled,
  healthSourceConfigWithNoMetricThresholdsAndMetricPacks
} from './MetricThresholdContainer.mock'

function WrapperComponent(props: MetricThresholdContainerProps): JSX.Element {
  return (
    <TestWrapper>
      <Formik initialValues={configurationsPageInitialValues} formName="configurations" onSubmit={jest.fn()}>
        <FormikForm>
          <MetricThresholdContainer {...props} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('Metric thresholds', () => {
  const props = {
    healthSourceConfig,
    groupedCreatedMetrics: {
      g1: [
        {
          groupName: {
            label: 'g1',
            value: 'g1'
          },
          metricName: 'M1',
          continuousVerification: true
        }
      ]
    }
  }

  describe('Metric thresholds config tests', () => {
    test('should check metric threshold should not get rendered, if there is no custom metrics available', () => {
      const newProps = { ...props, groupedCreatedMetrics: {} }
      render(<WrapperComponent {...newProps} />)

      expect(screen.queryByTestId(/commonHealthSource_metricThresholds/)).not.toBeInTheDocument()
    })

    test('should check metric threshold should not get rendered, if health source config is turned on and metric packs are enabled', () => {
      const newProps = { ...props, healthSourceConfig: healthSourceConfigWithMetricPacksEnabled }
      render(<WrapperComponent {...newProps} />)
      expect(screen.queryByTestId(/commonHealthSource_metricThresholds/)).not.toBeInTheDocument()
    })

    test('should check metric threshold should get rendered, if health source config is turned on', () => {
      const newProps = { ...props, healthSourceConfig: healthSourceConfigWithMetricThresholdsEnabled }
      render(<WrapperComponent {...newProps} />)
      expect(screen.queryByTestId(/commonHealthSource_metricThresholds/)).toBeInTheDocument()
    })

    test('should check metric threshold should not get rendered, if health source config is turned off', () => {
      const newProps = { ...props, healthSourceConfig: healthSourceConfigWithMetricThresholdsDisabled }
      render(<WrapperComponent {...newProps} />)
      expect(screen.queryByTestId(/commonHealthSource_metricThresholds/)).not.toBeInTheDocument()
    })

    test('should check metric threshold should not get rendered, if metric threshold is not passed in the health source config', () => {
      const newProps = { ...props, healthSourceConfig: healthSourceConfigWithNoMetricThresholdsAndMetricPacks }
      render(<WrapperComponent {...newProps} />)
      expect(screen.queryByTestId(/commonHealthSource_metricThresholds/)).not.toBeInTheDocument()
    })

    test('should check metric threshold should be rendered, if all configs are enabled', () => {
      render(<WrapperComponent {...props} />)
      expect(screen.getByTestId(/commonHealthSource_metricThresholds/)).toBeInTheDocument()
    })

    test('should check metric threshold should not be rendered, if all configs are enabled and there is no custom metrics with CV enabled', () => {
      const newProps = {
        ...props,
        groupedCreatedMetrics: {
          g1: [
            {
              groupName: {
                label: 'g1',
                value: 'g1'
              },
              metricName: 'M1',
              continuousVerification: false
            }
          ]
        }
      }
      render(<WrapperComponent {...newProps} />)
      expect(screen.queryByTestId(/commonHealthSource_metricThresholds/)).not.toBeInTheDocument()
    })
    test('should check metric threshold should not render groups, if the metric packs is disabled', async () => {
      const { container } = render(<WrapperComponent {...props} />)
      const addMetricThresholdsButton = screen.getByText(/cv.monitoringSources.appD.addThreshold/)

      await act(async () => {
        await userEvent.click(addMetricThresholdsButton)
      })

      expect(container.querySelector("[name='ignoreThresholds.0.metricType']")).toBeInTheDocument()
      expect(container.querySelector("[name='ignoreThresholds.0.criteria.type']")).toBeInTheDocument()
      expect(container.querySelector("[name='ignoreThresholds.0.criteria.spec.greaterThan']")).toBeInTheDocument()
      expect(container.querySelector("[name='ignoreThresholds.0.criteria.spec.lessThan']")).toBeInTheDocument()
      expect(container.querySelector("[name='ignoreThresholds.0.groupName']")).not.toBeInTheDocument()
    })
  })

  describe('Metric thresholds functionality tests', () => {
    test('checks criteria dropdown and other functionalities works properly', async () => {
      const { container } = render(<WrapperComponent {...props} />)

      const addMetricThresholdsButton = screen.getByText(/cv.monitoringSources.appD.addThreshold/)

      await act(async () => {
        await userEvent.click(addMetricThresholdsButton)
      })

      const greaterThanInput = container.querySelector(`[name="ignoreThresholds.0.criteria.spec.greaterThan"]`)
      const lessThanInput = container.querySelector(`[name="ignoreThresholds.0.criteria.spec.lessThan"]`)

      expect(greaterThanInput).toBeInTheDocument()
      expect(lessThanInput).toBeInTheDocument()

      const selectCaretCriteriaType = container
        .querySelector(`[name="ignoreThresholds.0.criteria.type"] + [class*="bp3-input-action"]`)
        ?.querySelector('[data-icon="chevron-down"]')

      expect(selectCaretCriteriaType).toBeInTheDocument()
      await userEvent.click(selectCaretCriteriaType!)

      await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(2))

      expect(document.querySelectorAll('[class*="bp3-menu"] li')[0]).toHaveTextContent(
        'cv.monitoringSources.appD.absoluteValue'
      )
      expect(document.querySelectorAll('[class*="bp3-menu"] li')[1]).toHaveTextContent(
        'cv.monitoringSources.appD.percentageDeviation'
      )

      await act(async () => {
        await userEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[1])
      })

      expect(greaterThanInput).not.toBeInTheDocument()
      expect(lessThanInput).toBeInTheDocument()
    })
  })
})
