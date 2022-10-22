/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MapElkQueryToService } from './ElkQueryBuilder.types'

export const MapElkToServiceFieldNames = {
  METRIC_NAME: 'metricName',
  QUERY: 'query',
  TIMESTAMP_FORMAT: 'timeStampFormat',
  SERVICE_INSTANCE: 'serviceInstance',
  LOG_INDEXES: 'logIndexes',
  IDENTIFY_TIMESTAMP: 'identifyTimestamp',
  MESSAGE_IDENTIFIER: 'messageIdentifier',
  IS_STALE_RECORD: 'isStaleRecord'
}

export const initialFormData: MapElkQueryToService = {
  metricName: 'ELK Logs Query',
  query: '',
  timeStampFormat: '',
  serviceInstance: '',
  logIndexes: '',
  identifyTimestamp: '',
  messageIdentifier: ''
}
