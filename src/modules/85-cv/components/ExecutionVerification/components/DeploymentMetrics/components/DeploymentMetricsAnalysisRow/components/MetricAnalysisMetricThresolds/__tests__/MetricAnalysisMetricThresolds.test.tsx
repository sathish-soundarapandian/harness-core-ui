/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { MetricAnalysisMetricThresoldsProps } from '../MetricAnalysisMetricThresolds'
import MetricAnalysisMetricThresolds from '../MetricAnalysisMetricThresolds'
import { mockedThresholds } from './MetricAnalysisMetricThresolds.mock'

const WrapperComponent = (props: MetricAnalysisMetricThresoldsProps): JSX.Element => {
  return (
    <TestWrapper
      pathParams={{
        accountId: '1234_accountId',
        projectIdentifier: '1234_project',
        orgIdentifier: '1234_ORG'
      }}
    >
      <MetricAnalysisMetricThresolds {...props} />
    </TestWrapper>
  )
}

describe('MetricAnalysisMetricThresolds', () => {
  test('should render threshold table if the data is present', () => {
    const props = { ...mockedThresholds }

    const { getByText, queryByTestId } = render(<WrapperComponent {...props} />)
    // expect values are present
    expect(getByText('cv.metricsAnalysis.metricThresholds.thresholdType')).toBeInTheDocument()
    expect(getByText('cv.metricsAnalysis.metricThresholds.criteria')).toBeInTheDocument()
    expect(getByText('cv.metricsAnalysis.metricThresholds.value')).toBeInTheDocument()
    expect(getByText('cf.auditLogs.action')).toBeInTheDocument()
    expect(queryByTestId('metric-analysis-metric-threshold')).toBeInTheDocument()
  })
})
