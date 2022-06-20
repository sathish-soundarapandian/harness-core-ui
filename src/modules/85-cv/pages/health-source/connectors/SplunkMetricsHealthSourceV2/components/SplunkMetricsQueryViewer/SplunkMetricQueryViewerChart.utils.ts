/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { TimeSeriesSampleDTO } from 'services/cv'
import { chartsConfig } from '../../../GCOMetricsHealthSource/GCOWidgetChartConfig'

export function transformSplunkMetricSampleData(sampleData?: TimeSeriesSampleDTO[]): Highcharts.Options {
  if (!sampleData?.length) {
    return {}
  }

  const data: Highcharts.SeriesLineOptions[] = []
  const option: Highcharts.SeriesLineOptions = {
    name: '',
    data: [],
    type: 'line',
    color: '#25A6F7'
  }

  for (const sample of sampleData) {
    if (sample?.timestamp && sample.metricValue) {
      option.data?.push([sample.timestamp, sample.metricValue])
    }

    data.push(option)
  }

  const transformedValue = chartsConfig(data)
  return transformedValue
}
