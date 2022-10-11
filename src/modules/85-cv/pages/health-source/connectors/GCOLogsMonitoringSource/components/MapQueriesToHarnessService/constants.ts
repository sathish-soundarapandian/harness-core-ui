/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const MapGCPLogsToServiceFieldNames = {
  METRIC_NAME: 'metricName',
  QUERY: 'query',
  SERVICE_INSTANCE: 'serviceInstance',
  MESSAGE_IDENTIFIER: 'messageIdentifier',
  IDENTIFY_TIMESTAMP: 'identifyTimestamp',
  RECORD_COUNT: 'recordCount'
}

export const initialFormData = {
  metricName: 'GCO Logs Query',
  query: '',
  recordCount: 0,
  serviceInstance: '',
  messageIdentifier: ''
}
