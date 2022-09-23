/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const metricData = {
  status: 'SUCCESS',
  data: {
    metricValidationResponses: [
      {
        metricName: 'Calls per Minute',
        value: 0.0,
        status: 'SUCCESS'
      },
      {
        metricName: 'Apdex',
        value: 1.0,
        status: 'SUCCESS'
      },
      {
        metricName: 'Errors per Minute',
        value: null,
        status: 'NO_DATA'
      },
      {
        metricName: 'Average Response Time (ms)',
        value: null,
        status: 'NO_DATA'
      }
    ],
    metricPackName: 'Performance',
    overallStatus: 'SUCCESS'
  },
  metaData: null,
  correlationId: 'bad61fe7-2fb5-4144-83c7-17e8f3a1b1d7'
}

export const metricPack = {
  metaData: {},
  resource: [
    {
      uuid: 'D-2ObpgKQoOajGT7e-wzAQ',
      accountId: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: 'default',
      projectIdentifier: 'Demo',
      dataSourceType: 'NEW_RELIC',
      identifier: 'Performance',
      category: 'Performance' as any,
      metrics: [
        {
          name: 'Errors per Minute',
          type: 'ERROR',
          path: 'SELECT count(`apm.service.transaction.error.count`) FROM Metric',
          validationPath: 'SELECT average(`apm.service.error.count`) FROM Metric',
          responseJsonPath: 'results.[0].average',
          validationResponseJsonPath: 'total.results.[0].average',
          thresholds: [],
          included: true
        },
        {
          name: 'Average Response Time (ms)',
          type: 'RESP_TIME',
          path: 'SELECT average(`apm.service.transaction.duration`) FROM Metric',
          validationPath: 'SELECT average(`apm.service.duration`) FROM Metric',
          responseJsonPath: 'results.[0].average',
          validationResponseJsonPath: 'total.results.[0].average',
          thresholds: [],
          included: true
        },
        {
          name: 'Calls per Minute',
          type: 'THROUGHPUT',
          path: 'SELECT rate(count(apm.service.transaction.duration), 1 minute) FROM Metric',
          validationPath: 'SELECT rate(count(apm.service.duration), 1 minute) FROM Metric',
          responseJsonPath: 'results.[0].result',
          validationResponseJsonPath: 'total.results.[0].result',
          thresholds: [],
          included: true
        },
        {
          name: 'Apdex',
          type: 'APDEX',
          path: 'SELECT apdex(`apm.service.transaction.apdex`) FROM Metric',
          validationPath: 'SELECT apdex(`apm.service.apdex`) FROM Metric',
          responseJsonPath: 'results.[0].score',
          validationResponseJsonPath: 'total.results.[0].score',
          thresholds: [],
          included: true
        }
      ],
      thresholds: undefined
    }
  ],
  responseMessages: []
}

export const queryParam = {
  appId: '',
  appName: '',
  accountId: '',
  connectorIdentifier: 'connectorIdentifier',
  orgIdentifier: '',
  projectIdentifier: '',
  requestGuid: 'guid'
}

export const appdMetricData = {
  metricPackName: 'Performance',
  overallStatus: 'SUCCESS',
  values: [{ apiResponseStatus: 'SUCCESS', metricName: 'Calls per Minute', value: 0 }]
}

export const mockValidationResult = [
  {
    metricPackName: 'Performance',
    overallStatus: 'SUCCESS',
    values: [
      { apiResponseStatus: 'SUCCESS', metricName: 'Calls per Minute', value: 0 },
      { apiResponseStatus: 'SUCCESS', metricName: 'Apdex', value: 1 },
      { apiResponseStatus: 'NO_DATA', metricName: 'Errors per Minute', value: null },
      { apiResponseStatus: 'NO_DATA', metricName: 'Average Response Time (ms)', value: null }
    ]
  }
]
