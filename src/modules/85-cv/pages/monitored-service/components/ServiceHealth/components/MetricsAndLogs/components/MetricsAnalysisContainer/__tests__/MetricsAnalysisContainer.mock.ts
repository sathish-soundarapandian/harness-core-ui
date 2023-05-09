/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { RestResponsePageTimeSeriesMetricDataDTO } from 'services/cv'

export const mockedMetricsData = {
  resource: {
    totalPages: 4,
    totalItems: 34,
    pageItemCount: 10,
    pageSize: 10,
    content: [
      {
        projectIdentifier: 'Harshil',
        orgIdentifier: 'default',
        environmentIdentifier: 'Environment_102',
        serviceIdentifier: 'Service_102',
        metricType: 'RESP_TIME',
        category: null,
        groupName: '/api/account',
        metricName: 'Average Response Time (ms)',
        metricDataList: [
          {
            timestamp: 1630537200000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630537260000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630537320000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630537380000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630537440000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630537500000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630537560000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630537620000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630537680000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630537740000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630537800000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630537860000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630537920000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630537980000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630538040000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630538100000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630538160000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630538220000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630538280000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630538340000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630540200000,
            value: 0,
            risk: 'NO_ANALYSIS'
          },
          {
            timestamp: 1630540260000,
            value: 0,
            risk: 'NO_ANALYSIS'
          }
        ]
      }
    ],
    pageIndex: 0,
    empty: false
  }
}

export const mockedMetricsDataWithDeeplink: RestResponsePageTimeSeriesMetricDataDTO = {
  metaData: {},
  resource: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 10,
    content: [
      {
        projectIdentifier: 'demokaran',
        orgIdentifier: 'default',
        monitoredServiceIdentifier: 'prommock_testing',
        dataSourceType: 'PROMETHEUS',
        monitoredServiceDataSourceType: 'Prometheus',
        groupName: 'g1',
        metricName: 'Prometheus Metric',
        deeplinkURL:
          'http://35.214.81.102:9090/graph?g0.step_input=60&g0.expr=scrape_duration_seconds%7Bgroup%3D%22cv%22%2Cinstance%3D%22prometheuscv.cie-demo.co.uk%3A80%22%2Cjob%3D%22payment-service-nikpapag%22%7D&g0.range_input=87m&g0.end_input=2023-05-05+07%3A20&g0.tab=0',
        metricDataList: [
          {
            timestamp: 1683265920000,
            risk: 'NO_DATA'
          },
          {
            timestamp: 1683265980000,
            risk: 'NO_DATA'
          },
          {
            timestamp: 1683266040000,
            risk: 'NO_DATA'
          },
          {
            timestamp: 1683266100000,
            value: 0.009006256,
            risk: 'HEALTHY'
          },
          {
            timestamp: 1683266160000,
            value: 0.008301429,
            risk: 'HEALTHY'
          },
          {
            timestamp: 1683266220000,
            value: 0.008349191,
            risk: 'HEALTHY'
          }
        ]
      }
    ],
    pageIndex: 0,
    empty: false
  },
  responseMessages: []
}
