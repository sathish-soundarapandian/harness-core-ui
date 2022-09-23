/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum MONITORED_SERVICE_TYPE {
  DEFAULT = 'Default',
  CONFIGURED = 'Configured',
  TEMPLATE = 'Template'
}

export const monitoredServiceTypes = [
  { label: 'Default', value: MONITORED_SERVICE_TYPE.DEFAULT },
  // Note: Can be useful in future
  // { label: 'Configured', value: MONITORED_SERVICE_TYPE.CONFIGURED },
  { label: 'Template', value: MONITORED_SERVICE_TYPE.TEMPLATE }
]
