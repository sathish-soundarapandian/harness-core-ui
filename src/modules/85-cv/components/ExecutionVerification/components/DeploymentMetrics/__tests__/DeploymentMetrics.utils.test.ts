/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { transformMetricsExpectedResult } from './DeploymentMetrics.mock'
import { transformMetricData } from '../DeploymentMetrics.utils'
import { InputData } from '../components/DeploymentMetricsAnalysisRow/tests/DeploymentMetricsAnalysisRow.mocks'

describe('Unit tests for DeploymentMetrics utils', () => {
  test('Ensure transformMetricData works correctly', async () => {
    const selectedDataFormat = { label: 'Raw', value: 'raw' }
    const metricData = {
      content: InputData
    }
    expect(transformMetricData(selectedDataFormat, metricData)).toEqual(transformMetricsExpectedResult)
  })
})
