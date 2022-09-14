/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const MapElkToServiceFieldNames = {
  METRIC_NAME: 'metricName',
  QUERY: 'query',
  RECORD_COUNT: 'recordCount',
  IS_STALE_RECORD: 'isStaleRecord',
  HOST_NAME: 'hostName',
  TIMESTAMP_FIELD: 'timestampField',
  MESSAGE: 'message',
  TIMESTAMP_FORMAT: 'timestampFormat',
  SERVICE_INSTANCE: 'serviceInstance',
  LOG_INDEXES: 'logIndexes',
  IDENTIFY_TIMESTAMP: 'identify_timestamp'
}

export const initialFormData = {
  metricName: 'Elk Logs Query',
  query: '',
  recordCount: 0,
  serviceInstance: ''
}
