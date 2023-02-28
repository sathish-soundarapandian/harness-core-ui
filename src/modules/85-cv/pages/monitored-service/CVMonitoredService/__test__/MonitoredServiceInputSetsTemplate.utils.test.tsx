/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import type { StringKeys } from 'framework/strings'
import { getLabelByName } from '../MonitoredServiceInputSetsTemplate.utils'

function getString(key: StringKeys): StringKeys | string {
  return key
}

describe('Test MonitoredServiceInputSetsTemplate utils function', () => {
  test('should be able to give correct results for getLabelByName method', () => {
    expect(getLabelByName('applicationName', getString)).toEqual(
      'cv.healthSource.connectors.AppDynamics.applicationLabel'
    )
    expect(getLabelByName('tierName', getString)).toEqual('cv.healthSource.connectors.AppDynamics.trierLabel')
    expect(getLabelByName('completeMetricPath', getString)).toEqual(
      'cv.healthSource.connectors.AppDynamics.metricPathType.text'
    )
    expect(getLabelByName('serviceInstanceMetricPath', getString)).toEqual(
      'cv.healthSource.connectors.AppDynamics.serviceInstance'
    )
    expect(getLabelByName('serviceInstanceFieldName', getString)).toEqual(
      'cv.monitoringSources.serviceInstanceIdentifier'
    )
    expect(getLabelByName('connectorRef', getString)).toEqual('connectors.selectConnector')
    expect(getLabelByName('query', getString)).toEqual('cv.query')
    expect(getLabelByName('category', getString)).toEqual('Category for cv.monitoringSources.riskCategoryLabel')
    expect(getLabelByName('metricType', getString)).toEqual('Metric type for cv.monitoringSources.riskCategoryLabel')
    expect(getLabelByName('custom', getString)).toEqual('custom')
  })
})
