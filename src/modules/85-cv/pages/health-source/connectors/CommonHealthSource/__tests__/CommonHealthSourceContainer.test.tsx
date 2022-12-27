/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as useFeatureFlag from '@common/hooks/useFeatureFlag'
import { TestWrapper } from '@common/utils/testUtils'
import {
  initializeCreatedMetrics,
  initializeSelectedMetricsMap
} from '@cv/pages/health-source/common/CommonCustomMetric/CommonCustomMetric.utils'
import CommonHealthSourceContainer, { CommonHealthSourceContainerProps } from '../CommonHealthSource.container'
import { createHealthSourceData, initHealthSourceCustomForm } from '../CommonHealthSource.utils'

import {
  expectedHealthSourceData,
  healthSourceConfig,
  healthSourceConfigWithMetricThresholdsDisabled,
  healthSourceMetricValue,
  sourceDataMock,
  sourceDataMockWithcustomMetrics,
  sourceDataMockWithcustomMetricsCVDisabled
} from './CommonHealthSource.mock'

function WrapperComponent(props: CommonHealthSourceContainerProps): JSX.Element {
  return (
    <TestWrapper>
      <CommonHealthSourceContainer {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for CommonHealthSourceContainer', () => {
  const props = {
    data: {
      connectorRef: 'Sumo_logic',
      isEdit: false,
      healthSourceList: [],
      serviceRef: 'svcstageprometheus',
      environmentRef: 'envstageprometheus',
      monitoredServiceRef: {
        name: 'svcstageprometheus_envstageprometheus',
        identifier: 'svcstageprometheus_envstageprometheus'
      },
      existingMetricDetails: null,
      sourceType: 'SumoLogic',
      dataSourceType: 'Prometheus',
      product: {
        value: 'METRICS',
        label: 'SumoLogic Cloud Metrics'
      },
      healthSourceName: 'a',
      healthSourceIdentifier: 'a'
    },
    healthSourceConfig: healthSourceConfig,
    isTemplate: false,
    expressions: [],
    onSubmit: jest.fn()
  }
  test('Ensure CommonHealthSourceContainer component loads with the button to add metric', async () => {
    const { getByText } = render(<WrapperComponent {...props} />)
    await waitFor(() => expect(getByText('common.addName')).toBeInTheDocument())
  })

  test('should be able to click on the submit button and submit the form', async () => {
    const { getByText } = render(<WrapperComponent {...props} />)
    const submitButton = getByText('submit')
    await waitFor(() => expect(submitButton).toBeInTheDocument())
    userEvent.click(submitButton)
  })

  test('should validate createHealthSourceData', () => {
    const { selectedMetric, mappedMetrics } = initializeSelectedMetricsMap(
      'defaultMetricName',
      initHealthSourceCustomForm(),
      expectedHealthSourceData?.customMetricsMap
    )
    const customMetricsMap = new Map()
    customMetricsMap.set('appdMetric', healthSourceMetricValue)
    expect(selectedMetric).toEqual('defaultMetricName')
    initializeCreatedMetrics('defaultMetricName', selectedMetric, mappedMetrics)

    expect(createHealthSourceData(expectedHealthSourceData as any)).toEqual({
      connectorRef: 'TestAppD',
      failFastThresholds: undefined,
      identifier: undefined,
      ignoreThresholds: undefined,
      isEdit: true,
      customMetricsMap: new Map(),
      name: undefined,
      product: {
        label: 'Application Monitoring',
        value: 'Application Monitoring'
      },
      selectedMetric: undefined,
      type: undefined
    })
  })

  describe('Metric thresholds', () => {
    describe('Metric thresholds config tests', () => {
      test('should check metric threshold should not get rendered, if there is no custom metrics available', () => {
        const useFeatureFlags = jest.spyOn(useFeatureFlag, 'useFeatureFlag')
        useFeatureFlags.mockReturnValue(true)
        const newProps = {
          data: sourceDataMock,
          healthSourceConfig,
          isTemplate: false,
          expressions: [],
          onSubmit: jest.fn()
        }

        render(<WrapperComponent {...newProps} />)

        expect(screen.queryByTestId(/commonHealthSource_metricThresholds/)).not.toBeInTheDocument()
      })

      test('should check metric threshold should not get rendered, if feature flag is turned off', () => {
        const useFeatureFlags = jest.spyOn(useFeatureFlag, 'useFeatureFlag')
        useFeatureFlags.mockReturnValue(false)
        const newProps = {
          data: sourceDataMockWithcustomMetrics,
          healthSourceConfig,
          isTemplate: false,
          expressions: [],
          onSubmit: jest.fn()
        }

        render(<WrapperComponent {...newProps} />)

        expect(screen.queryByTestId(/commonHealthSource_metricThresholds/)).not.toBeInTheDocument()
      })

      test('should check metric threshold should not get rendered, if health source config is turned off', () => {
        const useFeatureFlags = jest.spyOn(useFeatureFlag, 'useFeatureFlag')
        useFeatureFlags.mockReturnValue(true)
        const newProps = {
          data: sourceDataMockWithcustomMetrics,
          healthSourceConfig: healthSourceConfigWithMetricThresholdsDisabled,
          isTemplate: false,
          expressions: [],
          onSubmit: jest.fn()
        }

        render(<WrapperComponent {...newProps} />)

        expect(screen.queryByTestId(/commonHealthSource_metricThresholds/)).not.toBeInTheDocument()
      })

      test('should check metric threshold should be rendered, if all configs are enabled', () => {
        const useFeatureFlags = jest.spyOn(useFeatureFlag, 'useFeatureFlag')
        useFeatureFlags.mockReturnValue(true)
        const newProps = {
          data: sourceDataMockWithcustomMetrics,
          healthSourceConfig,
          isTemplate: false,
          expressions: [],
          onSubmit: jest.fn()
        }

        render(<WrapperComponent {...newProps} />)

        expect(screen.getByTestId(/commonHealthSource_metricThresholds/)).toBeInTheDocument()
      })

      test('should check metric threshold should not be rendered, if all configs are enabled and there is no custom metrics with CV enabled', () => {
        const useFeatureFlags = jest.spyOn(useFeatureFlag, 'useFeatureFlag')
        useFeatureFlags.mockReturnValue(true)
        const newProps = {
          data: sourceDataMockWithcustomMetricsCVDisabled,
          healthSourceConfig,
          isTemplate: false,
          expressions: [],
          onSubmit: jest.fn()
        }

        render(<WrapperComponent {...newProps} />)

        expect(screen.queryByTestId(/commonHealthSource_metricThresholds/)).not.toBeInTheDocument()
      })
      test('should check metric threshold should not render groups, if the metric packs is disabled', () => {
        const useFeatureFlags = jest.spyOn(useFeatureFlag, 'useFeatureFlag')
        useFeatureFlags.mockReturnValue(true)
        const newProps = {
          data: sourceDataMockWithcustomMetrics,
          healthSourceConfig,
          isTemplate: false,
          expressions: [],
          onSubmit: jest.fn()
        }

        const { container } = render(<WrapperComponent {...newProps} />)

        const addMetricThresholdsButton = screen.getByText(/cv.monitoringSources.appD.addThreshold/)

        act(() => {
          userEvent.click(addMetricThresholdsButton)
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
        const useFeatureFlags = jest.spyOn(useFeatureFlag, 'useFeatureFlag')
        useFeatureFlags.mockReturnValue(true)
        const newProps = {
          data: sourceDataMockWithcustomMetrics,
          healthSourceConfig,
          isTemplate: false,
          expressions: [],
          onSubmit: jest.fn()
        }

        const { container } = render(<WrapperComponent {...newProps} />)

        const addMetricThresholdsButton = screen.getByText(/cv.monitoringSources.appD.addThreshold/)

        act(() => {
          userEvent.click(addMetricThresholdsButton)
        })

        const greaterThanInput = container.querySelector(`[name="ignoreThresholds.0.criteria.spec.greaterThan"]`)
        const lessThanInput = container.querySelector(`[name="ignoreThresholds.0.criteria.spec.lessThan"]`)

        expect(greaterThanInput).toBeInTheDocument()
        expect(lessThanInput).toBeInTheDocument()

        const selectCaretCriteriaType = container
          .querySelector(`[name="ignoreThresholds.0.criteria.type"] + [class*="bp3-input-action"]`)
          ?.querySelector('[data-icon="chevron-down"]')

        expect(selectCaretCriteriaType).toBeInTheDocument()
        userEvent.click(selectCaretCriteriaType!)

        await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(2))

        expect(document.querySelectorAll('[class*="bp3-menu"] li')[0]).toHaveTextContent(
          'cv.monitoringSources.appD.absoluteValue'
        )
        expect(document.querySelectorAll('[class*="bp3-menu"] li')[1]).toHaveTextContent(
          'cv.monitoringSources.appD.percentageDeviation'
        )

        act(() => {
          userEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[1])
        })

        expect(greaterThanInput).not.toBeInTheDocument()
        expect(lessThanInput).toBeInTheDocument()
      })
    })
  })
})
