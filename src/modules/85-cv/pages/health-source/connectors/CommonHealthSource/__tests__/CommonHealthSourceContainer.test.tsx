/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import {
  initializeCreatedMetrics,
  initializeSelectedMetricsMap
} from '@cv/pages/health-source/common/CommonCustomMetric/CommonCustomMetric.utils'
import CommonHealthSourceContainer, { CommonHealthSourceContainerProps } from '../CommonHealthSource.container'
import { createHealthSourceData, initHealthSourceCustomForm } from '../CommonHealthSource.utils'
import { expectedHealthSourceData, healthSourceMetricValue } from './CommonHealthSource.mock'

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
    healthSourceConfig: {
      customMetrics: {
        enabled: true
      },
      queryAndRecords: {
        enabled: true
      },
      sideNav: {
        shouldBeAbleToDeleteLastMetric: false
      }
    },
    isTemplate: false,
    expressions: [],
    onSubmit: jest.fn()
  }
  test('Ensure CommonHealthSourceContainer component loads with the button to add metric', async () => {
    const { getByText } = render(<WrapperComponent {...props} />)
    await waitFor(() => expect(getByText('cv.monitoringSources.addMetric')).toBeInTheDocument())
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
})
