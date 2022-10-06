/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getElkMappedMetric } from '../components/MapQueriesToHarnessService/utils'
import {
  createElkHealthSourcePayload,
  buildElkHealthSourceInfo,
  getMappedServicesAndEnvs
} from '../ElkHealthSource.utils'
import {
  setupSource,
  ElkPayload,
  data,
  params,
  setupSource_noData,
  setupSourcewithoutProduct
} from './ElkHealthSource.mock'

describe('Test Util functions', () => {
  test('Test CreateElkHealthSourcePayload', () => {
    expect(createElkHealthSourcePayload(setupSource)).toEqual(ElkPayload)
  })
  test('Test buildElkHealthSourceInfo', () => {
    expect(buildElkHealthSourceInfo(params, data)).toEqual(setupSourcewithoutProduct)
  })
  test('Test buildElkHealthSourceInfo with no data', () => {
    expect(buildElkHealthSourceInfo(params, null)).toEqual(setupSource_noData)
  })
  test('Test buildElkHealthSourceInfo with no data', () => {
    expect(getElkMappedMetric({ sourceData: setupSource, isConnectorRuntimeOrExpression: true })).toEqual({
      selectedMetric: 'ELK Logs Query',
      mappedMetrics: getMappedServicesAndEnvs(data)
    })
  })
})
