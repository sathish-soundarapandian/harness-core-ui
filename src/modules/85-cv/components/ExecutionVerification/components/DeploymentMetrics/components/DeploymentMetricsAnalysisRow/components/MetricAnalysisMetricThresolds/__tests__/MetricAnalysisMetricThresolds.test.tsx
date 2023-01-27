/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { MetricThresholdCriteriaV2, MetricThresholdV2 } from 'services/cv'
import type { MetricAnalysisMetricThresoldsProps } from '../MetricAnalysisMetricThresolds'
import MetricAnalysisMetricThresolds from '../MetricAnalysisMetricThresolds'

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
  const props = {
    thresholds: [
      {
        id: '6L6gbC9oRlCS8ypbtCi0rA',
        thresholdType: 'IGNORE' as MetricThresholdV2['thresholdType'],
        isUserDefined: false,
        action: 'Ignore' as MetricThresholdV2['action'],
        criteria: {
          measurementType: 'ratio' as MetricThresholdCriteriaV2['measurementType'],
          lessThanThreshold: 0
        }
      },
      {
        id: 'Fh-N1OUnTmmrBWhqqWqJvQ',
        thresholdType: 'IGNORE' as MetricThresholdV2['thresholdType'],
        isUserDefined: false,
        action: 'Ignore' as MetricThresholdV2['action'],
        criteria: {
          measurementType: 'delta' as MetricThresholdCriteriaV2['measurementType'],
          lessThanThreshold: 0
        }
      }
    ]
  }
  test('should render threshold table if the data is present', () => {
    const { getByText, queryByTestId } = render(<WrapperComponent {...props} />)
    // expect columns are present
    expect(getByText('THRESHOLD TYPE')).toBeInTheDocument()
    expect(getByText('CRITERIA')).toBeInTheDocument()
    expect(getByText('VALUE')).toBeInTheDocument()
    expect(getByText('ACTION')).toBeInTheDocument()
    expect(queryByTestId('metric-analysis-metric-threshold')).toBeInTheDocument()
  })

  test('should not render the table if the threshold data is not present', () => {
    const newProps = { ...props, thresholds: [] }
    const { queryByTestId } = render(<WrapperComponent {...newProps} />)

    expect(queryByTestId('metric-analysis-metric-threshold')).not.toBeInTheDocument()
  })
})
