/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const formikValue = {
  metricName: 'CustomHealth Metric 101',
  metricIdentifier: 'CustomHealthMetric101',
  groupName: { label: 'Group 1', value: 'Group 1' },
  continuousVerification: false,
  healthScore: true,
  sli: false,
  riskCategory: 'Errors/ERROR',
  serviceInstanceIdentifier: 'serviceInstance',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: true,
  queryType: 'SERVICE_BASED',
  requestMethod: 'POST',
  query: 'Select * from ',
  baseURL: '',
  pathURL:
    'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/cv/orgs/default/projects/CustomHealthSource/monitoringservices/edit/Service_101_QA?tab=Configurations',
  metricValue: '$.series.[*].pointlist.[*]',
  timestamp: '$.series.[*].pointlist.[*]',
  timestampFormat: 'MMMM DD YY',
  serviceInstancePath: '',
  startTime: { placeholder: 'start_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' },
  endTime: { placeholder: 'end_time', timestampFormat: 'MILLISECONDS', customTimestampFormat: '' }
}

export const connectorIdentifierMock = {
  label: 'custom-ELK',
  value: 'account.customELK',
  scope: 'account',
  live: true,
  connector: {
    name: 'custom-ELK',
    identifier: 'customELK',
    description: null,
    orgIdentifier: null,
    projectIdentifier: null,
    tags: {},
    type: 'CustomHealth',
    spec: {
      baseURL: 'http://elk6.dev.harness.io:9200/',
      headers: [
        {
          key: 'content-type',
          encryptedValueRef: null,
          value: 'application/json',
          valueEncrypted: false
        }
      ],
      params: [],
      method: 'GET',
      validationBody: null,
      validationPath: '*/_search',
      delegateSelectors: ['qa-automation-cv-chiplay']
    }
  }
}
