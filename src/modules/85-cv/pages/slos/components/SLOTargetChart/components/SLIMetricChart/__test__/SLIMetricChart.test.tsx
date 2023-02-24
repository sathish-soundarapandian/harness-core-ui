/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep } from 'lodash-es'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SLIEventTypes } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { SliMetricGraph } from '../SLIMetricChart'
import type { SLOTargetChartWithAPIGetSliGraphProps } from '../../../SLOTargetChart.types'
import { ServiceLevelIndicator, OnboardingAPIMock } from './SLIMetricChart.mock'

const Wrapper = (props: SLOTargetChartWithAPIGetSliGraphProps) => (
  <TestWrapper>
    <SliMetricGraph {...props} />
  </TestWrapper>
)

describe('Validate SLI Metric chart', () => {
  test('should render with no data', () => {
    const retryOnError = jest.fn()
    const { getByText } = render(<Wrapper serviceLevelIndicator={ServiceLevelIndicator} retryOnError={retryOnError} />)
    expect(getByText('cv.monitoringSources.gco.noMetricData')).toBeInTheDocument()
  })

  test('should render with loading', () => {
    const retryOnError = jest.fn()
    const { container } = render(
      <Wrapper serviceLevelIndicator={ServiceLevelIndicator} retryOnError={retryOnError} loading={true} />
    )
    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()
  })

  test('should render with error', () => {
    const retryOnError = jest.fn()
    const { getByText } = render(
      <Wrapper serviceLevelIndicator={ServiceLevelIndicator} retryOnError={retryOnError} error={'API Failure'} />
    )
    expect(getByText('API Failure')).toBeInTheDocument()
    fireEvent.click(getByText('Retry'))
    expect(retryOnError).toHaveBeenCalled()
  })

  test('should render with data for ratio based', () => {
    const retryOnError = jest.fn()
    const { getByText } = render(
      <Wrapper
        serviceLevelIndicator={ServiceLevelIndicator}
        retryOnError={retryOnError}
        metricGraphData={OnboardingAPIMock.resource.metricGraphs}
      />
    )
    expect(getByText('cv.slos.validRequests:')).toBeInTheDocument()
    expect(getByText('cv.slos.goodRequests:')).toBeInTheDocument()
  })

  test('should render with data for ratio based', () => {
    const retryOnError = jest.fn()
    const { getByText } = render(
      <Wrapper
        serviceLevelIndicator={ServiceLevelIndicator}
        retryOnError={retryOnError}
        metricGraphData={OnboardingAPIMock.resource.metricGraphs}
      />
    )
    expect(getByText('cv.slos.validRequests:')).toBeInTheDocument()
    expect(getByText('cv.slos.goodRequests:')).toBeInTheDocument()
  })

  test('should render with data for ratio based with Bad Metric', () => {
    const clonedServiceLevelIndicator = cloneDeep(ServiceLevelIndicator)
    clonedServiceLevelIndicator.spec.spec.eventType = SLIEventTypes.BAD
    const retryOnError = jest.fn()
    const { getByText } = render(
      <Wrapper
        retryOnError={retryOnError}
        serviceLevelIndicator={clonedServiceLevelIndicator}
        metricGraphData={OnboardingAPIMock.resource.metricGraphs}
      />
    )
    expect(getByText('cv.slos.validRequests:')).toBeInTheDocument()
    expect(getByText('cv.slos.badRequests:')).toBeInTheDocument()
  })

  test('should render with data for threshold based', () => {
    const clonedMock: { prometheus_metric?: any } = cloneDeep(OnboardingAPIMock.resource.metricGraphs)
    delete clonedMock?.prometheus_metric
    const retryOnError = jest.fn()
    const { getByText } = render(
      <Wrapper
        serviceLevelIndicator={{
          ...ServiceLevelIndicator,
          spec: { ...ServiceLevelIndicator.spec, type: 'Threshold' }
        }}
        retryOnError={retryOnError}
        metricGraphData={clonedMock}
      />
    )
    expect(getByText('cv.minimum:')).toBeInTheDocument()
    expect(getByText('ce.perspectives.nodeDetails.aggregation.maximum:')).toBeInTheDocument()
    expect(getByText('ce.perspectives.nodeDetails.aggregation.average:')).toBeInTheDocument()
  })
})
