/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { initializeGroupNames } from '@cv/components/GroupName/GroupName.utils'
import { getBasePathValue, getMetricPathValue } from '../AppDCustomMetricForm.utils'
import { appdMetric, mappedMetricsMap } from './AppDCustomMetricForm.mock'

describe('Validate  utils functions', () => {
  test('should validate getBasePathValue and getMetricPathValue', () => {
    expect(getBasePathValue(appdMetric.basePath)).toEqual('Overall Application Performance')
    expect(getMetricPathValue(appdMetric.metricPath)).toEqual('Calls per Minute')
  })

  test('should validate initializeGroupNames', () => {
    expect(initializeGroupNames(mappedMetricsMap, val => val)).toEqual([
      { label: 'cv.addNew', value: '' },
      { label: 'g1', value: 'g1' },
      { label: 'g2', value: 'g2' }
    ])
  })
})
