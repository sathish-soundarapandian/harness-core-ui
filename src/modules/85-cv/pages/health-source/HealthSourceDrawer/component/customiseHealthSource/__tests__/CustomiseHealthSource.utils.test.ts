/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { HealthSourceTypes } from '@cv/pages/health-source/types'
import { createHealthsourceList, getSelectedProductInfo } from '../CustomiseHealthSource.utils'
import { RowData, healthSourcesPayload } from './CustomiseHealthSource.mock'

describe('Test Util functions', () => {
  test('Test CreateHealthsourceList', () => {
    // Creating new healthsource
    expect(createHealthsourceList({ healthSourceList: [] }, healthSourcesPayload)).toEqual([healthSourcesPayload])

    healthSourcesPayload.name = 'Splunk dev 14'
    RowData.healthSourceList[1].name = 'Splunk dev 14'
    // Updating existing healthsource
    expect(createHealthsourceList(RowData, healthSourcesPayload)).toEqual([...RowData.healthSourceList])
  })

  test('Test CreateHealthsourceList when selected product is ElasticSearch', () => {
    const selectedProduct = HealthSourceTypes.Elk
    expect(getSelectedProductInfo(selectedProduct)).toEqual(HealthSourceTypes.ElasticSearch_Logs)
  })

  test('Test CreateHealthsourceList when selected product is HealthSourceTypes SumologicMetrics', () => {
    const selectedProduct = HealthSourceTypes.SumologicMetrics
    expect(getSelectedProductInfo(selectedProduct)).toEqual(HealthSourceTypes.SumologicMetrics)
  })
})
