/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import type { StringKeys } from 'framework/strings'
import { getFieldLabelForVerifyTemplate, getLabelByName } from '../MonitoredServiceInputSetsTemplate.utils'

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

  test('should be able to give correct results for getFieldLabelForVerifyTemplate method', () => {
    expect(getFieldLabelForVerifyTemplate('applicationName', getString)).toEqual(
      'cv.monitoringSources.appD.applicationName'
    )
    expect(getFieldLabelForVerifyTemplate('tierName', getString)).toEqual('cv.monitoringSources.appD.tierName')
    expect(getFieldLabelForVerifyTemplate('completeMetricPath', getString)).toEqual(
      'cv.monitoringSources.appD.completeMetricPath'
    )
    expect(getFieldLabelForVerifyTemplate('serviceInstanceMetricPath', getString)).toEqual(
      'cv.monitoringSources.appD.serviceInstanceMetricPath'
    )
    expect(getFieldLabelForVerifyTemplate('serviceInstanceFieldName', getString)).toEqual(
      'cv.monitoringSources.appD.serviceInstanceFieldName'
    )
    expect(getFieldLabelForVerifyTemplate('indexes', getString)).toEqual(
      'cv.monitoringSources.datadogLogs.logIndexesLabel'
    )
    expect(getFieldLabelForVerifyTemplate('connectorRef', getString)).toEqual('connector')
    expect(getFieldLabelForVerifyTemplate('query', getString)).toEqual('cv.query')
    expect(getFieldLabelForVerifyTemplate('category', getString)).toEqual(
      'Category for cv.monitoringSources.riskCategoryLabel'
    )
    expect(getFieldLabelForVerifyTemplate('metricType', getString)).toEqual(
      'Metric type for cv.monitoringSources.riskCategoryLabel'
    )

    expect(getFieldLabelForVerifyTemplate('metricValueJsonPath', getString)).toEqual(
      'cv.healthSource.connectors.NewRelic.metricFields.metricValueJsonPath.label'
    )
    expect(getFieldLabelForVerifyTemplate('timestampJsonPath', getString)).toEqual(
      'cv.healthSource.connectors.NewRelic.metricFields.timestampJsonPath.label'
    )

    expect(getFieldLabelForVerifyTemplate('custom', getString)).toEqual('custom')
  })
})
